# Cardápio Saboritte - Fluxo Simplificado

Sistema que **primeiro busca do Supabase**, depois permite buscar da **API externa**.

## 🎯 Fluxo de Funcionamento

### 1️⃣ **Primeira Carga**
- Sistema verifica **automaticamente** se há dados no Supabase
- Se **vazio**: mostra mensagem para buscar da API
- Se **tem dados**: exibe dados do Supabase

### 2️⃣ **Botões da Interface**

| Botão | Função | Quando Usar |
|-------|--------|-------------|
| **📊 Atualizar** | Recarrega do Supabase | Dados já salvos, quer atualizar |
| **🌐 Buscar da API** | Busca da API Saboritte (temporário) | Ver dados atuais da Saboritte |
| **💾 Salvar no Supabase** | Salva dados da API → Supabase | Após buscar da API, quer persistir |

### 3️⃣ **Indicadores Visuais**

| Indicador | Significado |
|-----------|-------------|
| 📊 **Verde** | Dados do Supabase (persistidos) |
| 🌐 **Laranja** | Dados temporários da API |
| 💾 **Cinza** | Dados em cache local |

## 🗄️ Estrutura do Banco

Execute no Supabase:

```sql
-- Tabela única simplificada
CREATE TABLE saboritte_menu (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(500) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    descricao TEXT,
    codigo_barras VARCHAR(255),
    imagem_url TEXT,
    variacoes JSONB DEFAULT '[]',
    opcionais JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_sync TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Como Usar

### **Primeira Vez** (Supabase Vazio)
1. Execute o SQL no Supabase
2. Configure credenciais Saboritte
3. Clique **🌐 Buscar da API** → dados temporários aparecem
4. Clique **💾 Salvar no Supabase** → dados salvos permanentemente
5. Próximas vezes: sistema carrega automaticamente do Supabase

### **Uso Rotineiro**
- **📊 Atualizar**: Recarrega do Supabase (rápido)
- **🌐 Buscar da API**: Ver dados atuais da Saboritte (temporário)
- **💾 Salvar no Supabase**: Persistir após buscar da API

## 📊 Arquivos Importantes

1. **`saboritte-simple-schema.sql`** - Estrutura do banco
2. **`lib/saboritte-service.ts`** - Lógica de sync
3. **`hooks/useCardapioSaboritte.ts`** - Hooks React
4. **`cardapio-saboritte/page.tsx`** - Interface

## 🔄 Fluxo Técnico

```
1. Página carrega → Hook busca Supabase primeiro
   ↓
2a. Se tem dados → Exibe dados do Supabase 📊
   ↓
2b. Se vazio → Mostra botão para buscar da API 🌐
   ↓
3. Usuário clica "Buscar da API" → Dados temporários 🌐
   ↓
4. Usuário clica "Salvar no Supabase" → Dados persistidos 📊
```

## 💡 Vantagens

- ✅ **Primeiro Supabase**: Dados persistidos carregam automaticamente
- ✅ **Depois API**: Permissão explícita para buscar dados externos
- ✅ **Indicadores claros**: Usuário sabe sempre a origem dos dados
- ✅ **Controle total**: 3 botões específicos para cada ação
- ✅ **Performance**: Supabase é mais rápido que API externa

## 🛠️ Troubleshooting

**Problema**: "Nenhum produto no Supabase"  
**Solução**: Use 🌐 Buscar da API → 💾 Salvar no Supabase

**Problema**: "Erro na API"  
**Solução**: Verifique credenciais Saboritte nas configurações

**Problema**: "Dados desatualizados"  
**Solução**: 🌐 Buscar da API (temporário) ou 💾 Salvar no Supabase (permanente)

**Problema**: "Botão desabilitado"  
**Solução**: Configure credenciais Saboritte primeiro