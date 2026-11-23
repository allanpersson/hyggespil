/* Hyggespil: appens egne flag.
 *
 * I Home Assistant er denne fil tom. Android-appen skriver sin egen udgave af
 * filen ind i assets ved bygningen (se tools/synk_spil.py), så appen kan fortælle
 * spillet, at den kører lokalt på telefonen – og om den er Play-udgaven.
 *
 *   window.HSA = { android: true, play: true }
 */
window.HSA = window.HSA || {};
