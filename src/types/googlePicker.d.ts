// Ambient declarations for Google Picker (loaded at runtime from https://apis.google.com/js/api.js,
// then `gapi.load('picker', ...)` — a second, separate script from Identity Services). Only types
// the specific subset of the API this app actually calls.
interface GooglePickerDocument {
  id: string
  name: string
  mimeType: string
}

interface GooglePickerResponseObject {
  action: string
  docs?: GooglePickerDocument[]
}

interface GooglePickerView {
  setMimeTypes(mimeTypes: string): GooglePickerView
}

interface GooglePicker {
  setVisible(visible: boolean): void
}

interface GooglePickerBuilder {
  addView(view: GooglePickerView): GooglePickerBuilder
  setOAuthToken(token: string): GooglePickerBuilder
  setDeveloperKey(key: string): GooglePickerBuilder
  setCallback(callback: (data: GooglePickerResponseObject) => void): GooglePickerBuilder
  build(): GooglePicker
}

interface GoogleGlobalNamespace {
  picker: {
    DocsView: new (viewId?: string) => GooglePickerView
    PickerBuilder: new () => GooglePickerBuilder
    ViewId: { DOCS: string }
    Action: { PICKED: string; CANCEL: string }
  }
}

interface Window {
  gapi?: {
    load(api: string, options: { callback: () => void }): void
  }
}
