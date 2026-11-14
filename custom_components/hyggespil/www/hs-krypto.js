/* Hyggespil: dekryptering af spørgsmålspuljerne.
 *
 * Puljerne ligger ikke længere som læsbar tekst, men som en base64-blob, der dekrypteres
 * her ved opstart og køres i det globale scope. Det gør det ikke trivielt at læse eller
 * kopiere spørgsmål og svar fra GitHub eller "vis kilde".
 *
 * VIGTIGT: Nøglen skal ligge i browseren for at spillet kan køre uden en server. En
 * besluttet person kan derfor stadig trække den ud og dekryptere puljen. Det her er
 * obfuskering mod tilfældig kopiering og snyd – ikke hemmeligholdelse.
 */
(function () {
  if (window.hsKrypt) return;
  /* 32 tilfældige bytes, delt op så nøglen ikke står som én streng */
  const K = ['q7Kp2mWv', 'Lb9RaX4t', 'Yc8NHs3F', 'uJ6DEz5G',
             'Pw1VrT0B', 'kM7QnC2S', 'dL9HfA4J', 'gX6ZvB3Y'].join('');

  function rc4(key, str) {
    const s = new Uint8Array(256);
    for (let i = 0; i < 256; i++) s[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + key.charCodeAt(i % key.length)) & 255;
      const t = s[i]; s[i] = s[j]; s[j] = t;
    }
    let i = 0; j = 0;
    const ud = new Array(str.length);
    for (let n = 0; n < str.length; n++) {
      i = (i + 1) & 255;
      j = (j + s[i]) & 255;
      const t = s[i]; s[i] = s[j]; s[j] = t;
      ud[n] = String.fromCharCode(str.charCodeAt(n) ^ s[(s[i] + s[j]) & 255]);
    }
    return ud.join('');
  }

  window.HS_KEY = K;
  window.hsKrypt = function (id, b64) {
    try {
      const rå = atob(b64);
      const klart = rc4(K + '|' + id, rå);
      (0, eval)(klart);
    } catch (e) {
      try { console.error('HS pulje kunne ikke læses:', id, e); } catch (x) {}
    }
  };
})();
