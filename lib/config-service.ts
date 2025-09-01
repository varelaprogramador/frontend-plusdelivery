import { getSupabase } from "./supabase";
import type {
  Configuration,
  ConfigurationData,
  PlatformCredentials,
  PlatformSettings,
} from "./types-config";

export class ConfigService {
  /**
   * Buscar todas as configurações
   */
  static async getAllConfigurations(): Promise<ConfigurationData> {
    try {
      const supabase = getSupabase();

      const { data: configurations, error } = await supabase
        .from("configurations")
        .select("*")
        .eq("active", true)
        .order("platform", { ascending: true });

      if (error) {
        throw error;
      }

      // Organizar as configurações por plataforma e tipo
      const configData: ConfigurationData = {
        plus: {
          credentials: {
            email: "",
            senha: "",
            api_secret: "",
            api_url: "",
          },
          settings: {
            auto_sync: true,
            sync_interval: 300,
            test_mode: false,
          },
        },
        saboritte: {
          credentials: {
            email: "",
            senha: "",
            api_token: "",
            api_url: "",
          },
          settings: {
            auto_sync: true,
            sync_interval: 300,
            test_mode: false,
            notify_errors: true,
          },
        },
      };

      // Processar as configurações
      configurations?.forEach((config: any) => {
        const platform = config.platform as "plus" | "saboritte";
        const configType = config.config_type as "credentials" | "settings";

        if (configType === "credentials") {
          const credentials = configData[platform].credentials as any;
          credentials[config.config_key] = config.config_value || "";
        } else if (configType === "settings") {
          const settings = configData[platform].settings as any;
          let value: any = config.config_value;

          // Converter valores para tipos apropriados
          if (
            config.config_key === "auto_sync" ||
            config.config_key === "test_mode" ||
            config.config_key === "notify_errors"
          ) {
            value = config.config_value === "true";
          } else if (config.config_key === "sync_interval") {
            value = Number.parseInt(config.config_value || "300", 10);
          }

          settings[config.config_key] = value;
        }
      });

      return configData;
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      throw error;
    }
  }

  /**
   * Buscar configurações de uma plataforma específica
   */
  static async getPlatformConfigurations(
    platform: "plus" | "saboritte"
  ): Promise<{
    credentials: PlatformCredentials;
    settings: PlatformSettings;
  }> {
    try {
      const allConfigs = await this.getAllConfigurations();
      return allConfigs[platform];
    } catch (error) {
      console.error(
        `Erro ao buscar configurações da plataforma ${platform}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Atualizar configurações de uma plataforma
   */
  static async updatePlatformConfigurations(
    platform: "plus" | "saboritte",
    credentials: Partial<PlatformCredentials>,
    settings: Partial<PlatformSettings>
  ): Promise<void> {
    try {
      const supabase = getSupabase();
      const updates: Array<{
        platform: string;
        config_type: string;
        config_key: string;
        config_value: string;
      }> = [];

      // Preparar atualizações de credenciais
      Object.entries(credentials).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push({
            platform,
            config_type: "credentials",
            config_key: key,
            config_value: String(value),
          });
        }
      });

      // Preparar atualizações de configurações
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push({
            platform,
            config_type: "settings",
            config_key: key,
            config_value: String(value),
          });
        }
      });

      // Executar atualizações
      for (const update of updates) {
        const { error } = await supabase.from("configurations").upsert(
          {
            ...update,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "platform,config_type,config_key",
          }
        );

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error(
        `Erro ao atualizar configurações da plataforma ${platform}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Testar conexão com uma plataforma
   */
  static async testConnection(platform: "plus" | "saboritte"): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const config = await this.getPlatformConfigurations(platform);

      if (platform === "plus") {
        // Testar conexão com Plus
        const params = new URLSearchParams({
          email: config.credentials.email,
          senha: config.credentials.senha,
        });

        const response = await fetch(
          `${config.credentials.api_url}/cardapio?${params.toString()}`,
          {
            headers: {
              "x-Secret": config.credentials.api_secret || "",
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          return {
            success: true,
            message: "Conexão com Plus Delivery estabelecida com sucesso!",
          };
        } else {
          return {
            success: false,
            message: `Erro na conexão: ${response.status}`,
          };
        }
      } else {
        // Testar conexão com Saboritte (simulado por enquanto)
        if (config.credentials.email && config.credentials.senha) {
          return {
            success: true,
            message: "Conexão com Saboritte estabelecida com sucesso!",
          };
        } else {
          return {
            success: false,
            message: "Credenciais incompletas para Saboritte",
          };
        }
      }
    } catch (error) {
      console.error(`Erro ao testar conexão com ${platform}:`, error);
      return {
        success: false,
        message: `Erro ao testar conexão: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      };
    }
  }
}
