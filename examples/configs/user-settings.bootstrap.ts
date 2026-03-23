import { registerLocale, resetLocale } from "@formosaic/core";
import type { ICoreLocaleStrings } from "@formosaic/core";

/** Supported locale codes and their partial string overrides */
const LOCALE_OVERRIDES: Record<string, Partial<ICoreLocaleStrings>> = {
  es: {
    save: "Guardar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    add: "Añadir",
    remove: "Eliminar",
    close: "Cerrar",
    clear: "Limpiar",
    required: "Requerido",
    loading: "Cargando…",
    validating: "Validando…",
    noResultsFound: "Sin resultados",
    thisFieldIsRequired: "Este campo es obligatorio",
    invalidEmail: "Introduce una dirección de correo válida",
    invalidUrl: "Introduce una URL válida",
    saved: "Guardado",
    saveFailed: "Error al guardar",
  },
  fr: {
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    add: "Ajouter",
    remove: "Supprimer",
    close: "Fermer",
    clear: "Effacer",
    required: "Requis",
    loading: "Chargement…",
    validating: "Validation…",
    noResultsFound: "Aucun résultat",
    thisFieldIsRequired: "Ce champ est obligatoire",
    invalidEmail: "Adresse e-mail invalide",
    invalidUrl: "URL invalide",
    saved: "Enregistré",
    saveFailed: "Échec de l'enregistrement",
  },
  de: {
    save: "Speichern",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    add: "Hinzufügen",
    remove: "Entfernen",
    close: "Schließen",
    clear: "Löschen",
    required: "Pflichtfeld",
    loading: "Laden…",
    validating: "Wird validiert…",
    noResultsFound: "Keine Ergebnisse",
    thisFieldIsRequired: "Dieses Feld ist erforderlich",
    invalidEmail: "Ungültige E-Mail-Adresse",
    invalidUrl: "Ungültige URL",
    saved: "Gespeichert",
    saveFailed: "Speichern fehlgeschlagen",
  },
  ja: {
    save: "保存",
    cancel: "キャンセル",
    confirm: "確認",
    add: "追加",
    remove: "削除",
    close: "閉じる",
    clear: "クリア",
    required: "必須",
    loading: "読み込み中…",
    validating: "検証中…",
    noResultsFound: "結果なし",
    thisFieldIsRequired: "このフィールドは必須です",
    invalidEmail: "有効なメールアドレスを入力してください",
    invalidUrl: "有効なURLを入力してください",
    saved: "保存しました",
    saveFailed: "保存に失敗しました",
  },
};

/**
 * Switches the active locale used by Formosaic's LocaleRegistry.
 *
 * Resets to English defaults first, then applies the requested locale's
 * partial string overrides (if any). Falls back to English ("en") when
 * the locale code is not in the overrides map.
 *
 * Pattern: resetLocale() → registerLocale(partialStrings)
 */
export function switchLocale(locale: string): void {
  // Always reset to English defaults before applying overrides
  resetLocale();

  const overrides = LOCALE_OVERRIDES[locale];
  if (overrides) {
    registerLocale(overrides);
  }
  // If locale === "en" or unknown, resetLocale() already restored English defaults
}

/**
 * Bootstraps the user settings form by wiring the language field's
 * onChange to locale switching.
 *
 * Call this once at app startup. The returned cleanup function should be
 * called if the form is unmounted to avoid stale registrations.
 */
export function bootstrapUserSettings(): () => void {
  // Initialize with English (noop — already the default)
  resetLocale();

  // Return a cleanup that restores English if the component unmounts
  return () => {
    resetLocale();
  };
}
