# Integração Cardápio com Supabase

Sistema de sincronização do cardápio Saboritte + Plus Delivery com armazenamento no Supabase.

## 📋 Estrutura da Solução

### Componentes Criados

1. **Script SQL** (`supabase-cardapio-schema.sql`)
   - Criação de tabelas no Supabase
   - Índices para performance
   - Triggers para updated_at automático
   - RLS (Row Level Security)

2. **Service Layer** (`cardapio-service.ts`)
   - Sincronização API → Supabase
   - Conversão entre formatos de dados
   - Histórico de sincronizações
   - Estatísticas do cardápio

3. **Hooks Atualizados** (`useCardapioSaboritte.ts`)
   - Integração com Supabase
   - Fallback para API
   - Cache inteligente
   - Novos hooks para sync e estatísticas

4. **Interface Aprimorada** (`cardapio-saboritte/page.tsx`)
   - Indicadores visuais da fonte dos dados
   - Botões para sync completo vs. atualização
   - Estatísticas em tempo real

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

```sql
-- Produtos Saboritte
saboritte_products
├── id (UUID, PK)
├── external_id (VARCHAR, UK) -- ID original
├── nome (VARCHAR)
├── descricao (TEXT)
├── categoria (VARCHAR)
├── preco (DECIMAL)
├── ativo (BOOLEAN)
├── codigo_barras (VARCHAR)
├── imagem_url (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Variações dos produtos
saboritte_variations
├── id (UUID, PK)
├── product_id (UUID, FK)
├── descricao (VARCHAR)
├── preco (DECIMAL)
└── ...

-- Opcionais dos produtos
saboritte_optionals
├── id (UUID, PK)
├── product_id (UUID, FK)
├── external_id (VARCHAR)
├── nome (VARCHAR)
├── obrigatorio (BOOLEAN)
└── ...

-- Produtos Plus Delivery
plus_products
├── id (UUID, PK)
├── external_id (VARCHAR, UK)
├── nome (VARCHAR)
├── categoria (VARCHAR)
├── valor (DECIMAL)
├── promocao (DECIMAL)
└── ...

-- Vinculações entre produtos
product_links
├── id (UUID, PK)
├── plus_product_id (UUID, FK)
├── saboritte_product_id (UUID, FK)
├── saboritte_variation_id (UUID, FK nullable)
├── active (BOOLEAN)
├── sync_price (BOOLEAN)
└── sync_availability (BOOLEAN)

-- Histórico de sincronizações
sync_history
├── id (UUID, PK)
├── sync_type (ENUM)
├── status (ENUM)
├── total_items (INTEGER)
├── processed_items (INTEGER)
├── error_items (INTEGER)
├── details (JSONB)
└── execution_time (INTEGER)
```

## 🚀 Como Usar

### 1. Configurar o Banco de Dados

```bash
# 1. No painel do Supabase, execute o script SQL
# Copie o conteúdo de supabase-cardapio-schema.sql
# Cole no SQL Editor do Supabase e execute
```

### 2. Verificar Variáveis de Ambiente

```env
# .env
NEXT_PUBLIC_SUPABASE_URL="sua-url-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Fluxo de Sincronização

#### Primeira Sincronização
1. Acesse a página **Cardápio Saboritte**
2. Configure suas credenciais Saboritte
3. Clique em **"Sincronizar com API"**
   - Busca dados da API Saboritte
   - Salva tudo no Supabase
   - Mostra indicador verde 📊 Supabase

#### Sincronizações Subsequentes
1. **"Atualizar Cardápio"**: Carrega do cache/Supabase
2. **"Sincronizar com API"**: Atualiza do servidor Saboritte

## 🔄 Fluxo de Dados

```
API Saboritte
     ↓
CardapioService.syncSaboritteFromAPI()
     ↓
Supabase Tables
     ↓
useCardapioSaboritte hook
     ↓
Interface (page.tsx)
```

## 📊 Funcionalidades

### Indicadores Visuais
- 📊 **Verde**: Dados do Supabase (sincronizados)
- 🌐 **Laranja**: Dados direto da API (temporário)

### Tipos de Sincronização
- **Atualização**: Carrega dados já sincronizados
- **Sincronização Completa**: API → Supabase

### Histórico e Monitoramento
- Registro de todas as sincronizações
- Estatísticas de produtos por fonte
- Tempo de execução e erros
- Status de sucesso/parcial/erro

## 🛠️ API do CardapioService

### Principais Métodos

```typescript
// Sincronizar Saboritte
CardapioService.syncSaboritteFromAPI(email, senha)

// Buscar produtos do Supabase
CardapioService.getSaboritteProducts(filters?)

// Conversão para compatibilidade
CardapioService.convertSupabaseSaboritteToLocal(products)

// Estatísticas
CardapioService.getCardapioStats()

// Histórico
CardapioService.getSyncHistory(limit?)
```

### Hooks Disponíveis

```typescript
// Hook principal (com fallback)
const { data, isFromSupabase, dataSource } = useCardapioSaboritte(email, senha)

// Hook de sincronização
const syncMutation = useCardapioSaboritteSync()

// Hook de estatísticas
const { data: stats } = useCardapioStats()
```

## 🔧 Manutenção

### Performance
- Índices otimizados para consultas frequentes
- Cache inteligente com staleTime
- Batch operations para inserções

### Monitoramento
```sql
-- Ver últimas sincronizações
SELECT * FROM sync_history 
ORDER BY created_at DESC 
LIMIT 10;

-- Estatísticas gerais
SELECT 
  (SELECT COUNT(*) FROM saboritte_products) as saboritte_count,
  (SELECT COUNT(*) FROM plus_products) as plus_count,
  (SELECT COUNT(*) FROM product_links WHERE active = true) as links_count;
```

### Limpeza de Dados
```sql
-- Limpar histórico antigo (30 dias)
DELETE FROM sync_history 
WHERE created_at < NOW() - INTERVAL '30 days';
```

## 🚨 Solução de Problemas

### Erro: "Tabela não existe"
- Execute o script `supabase-cardapio-schema.sql`
- Verifique as permissões RLS

### Sincronização Lenta
- Verifique os índices do banco
- Monitore o `execution_time` no histórico

### Dados não Aparecem
- Verifique as credenciais Saboritte
- Confirme a variável `NEXT_PUBLIC_API_URL`
- Veja o console para erros de CORS

### Fallback para API
- Normal na primeira vez (Supabase vazio)
- Após sincronizar, deve usar Supabase

## 📈 Próximos Passos

1. **Vinculações Automáticas**
   - Matching por nome/categoria
   - Sugestões de vinculação
   - Sync bidirecional de preços

2. **Plus Delivery**
   - Implementar sync do Plus
   - Tabelas já criadas

3. **Dashboard Analytics**
   - Métricas de sincronização
   - Análise de performance
   - Alertas automáticos

4. **API Webhooks**
   - Notificações de mudanças
   - Sync automático
   - Real-time updates

## 💡 Dicas de Uso

- **Primeira vez**: Sempre use "Sincronizar com API"
- **Rotina**: Use "Atualizar Cardápio" (mais rápido)
- **Monitoramento**: Acompanhe os indicadores visuais
- **Performance**: Sincronize em horários de baixo movimento
- **Backup**: O localStorage ainda funciona como cache secundário