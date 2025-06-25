export interface Configuration {
  id: string
  platform: "plus" | "saboritte"
  config_type: "credentials" | "settings"
  config_key: string
  config_value: string | null
  encrypted: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface PlatformCredentials {
  email: string
  senha: string
  api_token?: string
  api_secret?: string
  api_url: string
}

export interface PlatformSettings {
  auto_sync: boolean
  sync_interval: number
  test_mode: boolean
  notify_errors?: boolean
}

export interface ConfigurationData {
  plus: {
    credentials: PlatformCredentials
    settings: PlatformSettings
  }
  saboritte: {
    credentials: PlatformCredentials
    settings: PlatformSettings
  }
}
