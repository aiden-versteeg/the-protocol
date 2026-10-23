// =========================================================================
// PROTOCOL OS: ZERO-KNOWLEDGE FIREBASE ENCRYPTED CLOUD SYNC ENGINE
// =========================================================================

let firestoreDb = null;
let activeCryptoKey = null;
let syncDebounceTimer = null;

// Base64 helpers safe for large workout & photo payload strings
function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// 1. Derive 256-Bit AES Key using PBKDF2 (100,000 iterations)
async function deriveEncryptionKey(passphrase, saltBuffer) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// 2. Encrypt Payload Client-Side
async function encryptVaultPayload(payloadObject, key) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit AES-GCM IV
  const encoded = enc.encode(JSON.stringify(payloadObject));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  return {
    ciphertext: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv)
  };
}

// 3. Decrypt Payload Client-Side
async function decryptVaultPayload(ciphertextBase64, ivBase64, key) {
  const dec = new TextDecoder();
  const cipherBytes = base64ToBuffer(ciphertextBase64);
  const ivBytes = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    cipherBytes
  );

  return JSON.parse(dec.decode(decryptedBuffer));
}

// 4. Initialize Firebase App
function getFirebaseConfig() {
  return JSON.parse(localStorage.getItem('protocol_firebase_config') || 'null');
}

function initFirebaseClient() {
  const cfg = getFirebaseConfig();
  if (cfg && window.firebase) {
    if (!firebase.apps.length) {
      firebase.initializeApp(cfg);
    }
    firestoreDb = firebase.firestore();
    return true;
  }
  return false;
}

// 5. Connect or Restore Vault
async function unlockOrRegisterFirebaseVault(userId, passphrase, rawConfigInput) {
  userId = userId.trim().toLowerCase();
  passphrase = passphrase.trim();

  if (!userId || !passphrase) {
    alert("Please enter a User ID and Master Passphrase.");
    return false;
  }

  // Parse config (accepts either raw JSON or pasted JS object text)
  let configObj = getFirebaseConfig();
  if (rawConfigInput && rawConfigInput.trim()) {
    try {
      const cleanJson = rawConfigInput
        .replace(/const\s+firebaseConfig\s*=\s*/g, '')
        .replace(/;/g, '')
        .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
        .replace(/'/g, '"')
        .trim();
      configObj = JSON.parse(cleanJson);
      localStorage.setItem('protocol_firebase_config', JSON.stringify(configObj));
    } catch (e) {
      alert("Invalid Firebase Config syntax. Paste the full { apiKey: ... } object.");
      return false;
    }
  }

  if (!configObj) {
    alert("Please paste your Firebase configuration.");
    return false;
  }

  localStorage.setItem('protocol_sync_userId', userId);
  initFirebaseClient();

  try {
    const docRef = firestoreDb.collection('protocol_vault').doc(userId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Existing cloud data found: Decrypt and restore
      const data = docSnap.data();
      const saltBuffer = base64ToBuffer(data.salt);
      const key = await deriveEncryptionKey(passphrase, saltBuffer);

      let decrypted;
      try {
        decrypted = await decryptVaultPayload(data.ciphertext, data.iv, key);
      } catch (err) {
        throw new Error("Invalid Master Passphrase! Decryption failed.");
      }

      // Rehydrate local variables and storage
      if (decrypted.appData) appData = decrypted.appData;
      if (decrypted.userGoals) userGoals = decrypted.userGoals;
      if (decrypted.workoutHistory) workoutHistory = decrypted.workoutHistory;
      if (decrypted.customPresets) customPresets = decrypted.customPresets;
      if (decrypted.startDate) {
        START_DATE_KEY = decrypted.startDate;
        localStorage.setItem('protocol_start_date', START_DATE_KEY);
      }

      activeCryptoKey = key;
      localStorage.setItem('protocol_cached_salt', data.salt);
      sessionStorage.setItem('protocol_active_pass', passphrase);

      persist();
      alert(`Cloud Vault Decrypted! All workouts, weights, and logs restored.`);
      closeSyncModal();
      return true;

    } else {
      // New user vault: Initialize salt and push current state
      const saltBuffer = window.crypto.getRandomValues(new Uint8Array(16));
      const saltBase64 = bufferToBase64(saltBuffer);
      const key = await deriveEncryptionKey(passphrase, saltBuffer);

      activeCryptoKey = key;
      localStorage.setItem('protocol_cached_salt', saltBase64);
      sessionStorage.setItem('protocol_active_pass', passphrase);

      await pushEncryptedBackupToFirebase();
      alert(`New encrypted cloud vault initialized for "${userId}". Autosync active!`);
      closeSyncModal();
      return true;
    }
  } catch (err) {
    alert("Firebase Sync Error: " + err.message);
    return false;
  }
}

// 6. Push Encrypted Backup (Called automatically in the background)
async function pushEncryptedBackupToFirebase() {
  const userId = localStorage.getItem('protocol_sync_userId');
  if (!userId || !initFirebaseClient()) return;

  if (!activeCryptoKey) {
    const saltBase64 = localStorage.getItem('protocol_cached_salt');
    const pass = sessionStorage.getItem('protocol_active_pass');
    if (saltBase64 && pass) {
      activeCryptoKey = await deriveEncryptionKey(pass, base64ToBuffer(saltBase64));
    } else {
      return;
    }
  }

  const payload = {
    startDate: START_DATE_KEY,
    appData: appData,
    userGoals: userGoals,
    workoutHistory: workoutHistory,
    customPresets: customPresets,
    syncedAt: new Date().toISOString()
  };

  try {
    const saltBase64 = localStorage.getItem('protocol_cached_salt');
    const encrypted = await encryptVaultPayload(payload, activeCryptoKey);

    await firestoreDb.collection('protocol_vault').doc(userId).set({
      user_id: userId,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      salt: saltBase64,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    updateSyncIndicator(true);
  } catch (err) {
    console.warn("Background Firebase backup failed:", err);
    updateSyncIndicator(false);
  }
}

function queueEncryptedSync() {
  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    pushEncryptedBackupToFirebase();
  }, 1200);
}

function updateSyncIndicator(isOnline) {
  const dot = document.getElementById('cloudSyncStatusDot');
  if (dot) {
    dot.className = isOnline 
      ? "w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" 
      : "w-2 h-2 rounded-full bg-amber-500 animate-pulse";
  }
}

function openSyncModal() {
  const modal = document.getElementById('cloudSyncModal');
  if (!modal) return;
  document.getElementById('syncInputUserId').value = localStorage.getItem('protocol_sync_userId') || '';
  const existingCfg = getFirebaseConfig();
  if (existingCfg) {
    document.getElementById('syncInputConfig').value = JSON.stringify(existingCfg, null, 2);
  }
  modal.classList.remove('hidden');
}

function closeSyncModal() {
  const modal = document.getElementById('cloudSyncModal');
  if (modal) modal.classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
  initFirebaseClient();
});
