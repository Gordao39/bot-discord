const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  EmbedBuilder
} = require("discord.js");

// ================= CONFIG =================
const TOKEN = process.env.DISCORD_TOKEN;

const REGISTRO_CHANNEL_ID = "1463289005813661748";
const PROMOCAO_CHANNEL_ID = "1463289116241432690";
const LOG_CHANNEL_ID = "1463289165985878128";
// =========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= EMBEDS BASE =================
const EMBED_REGISTRO = new EmbedBuilder()
  .setColor(0x1abc9c)
  .setTitle("🔧 Registro da Mecânica")
  .setDescription(
    "**Bem-vindo à mecânica!**\n\n" +
    "📝 Faça seu registro corretamente para começar a trabalhar.\n\n" +
    "📌 **Regras:**\n" +
    "• Nome e sobrenome reais no RP\n" +
    "• ID correto\n\n" +
    "⚠️ Registros errados podem gerar punição."
  )
  .setFooter({ text: "Sistema da Mecânica • RP" });

const EMBED_PROMOCAO = new EmbedBuilder()
  .setColor(0xf1c40f)
  .setTitle("📈 Painel de Promoções")
  .setDescription(
    "**Área restrita para gestão da mecânica**\n\n" +
    "⬆️ Promova membros conforme a hierarquia\n" +
    "📋 Use cargos padronizados\n\n" +
    "⚠️ Uso indevido será punido."
  )
  .setFooter({ text: "Gestão Interna • Mecânica RP" });

// ================= BOTÕES =================
async function enviarBotaoRegistro() {
  const canal = await client.channels.fetch(REGISTRO_CHANNEL_ID);

  const botao = new ButtonBuilder()
    .setCustomId("registrar")
    .setLabel("Realizar Registro")
    .setEmoji("🧾")
    .setStyle(ButtonStyle.Success);

  await canal.send({
    embeds: [EMBED_REGISTRO],
    components: [new ActionRowBuilder().addComponents(botao)]
  });
}

async function enviarBotaoPromocao() {
  const canal = await client.channels.fetch(PROMOCAO_CHANNEL_ID);

  const botao = new ButtonBuilder()
    .setCustomId("abrir_promocao")
    .setLabel("Promover Membro")
    .setEmoji("⬆️")
    .setStyle(ButtonStyle.Primary);

  await canal.send({
    embeds: [EMBED_PROMOCAO],
    components: [new ActionRowBuilder().addComponents(botao)]
  });
}

// ================= READY =================
client.once("clientReady", async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  await enviarBotaoRegistro();
  await enviarBotaoPromocao();
});

// ================= INTERAÇÕES =================
client.on("interactionCreate", async interaction => {
  try {

    // ===== REGISTRO =====
    if (interaction.isButton() && interaction.customId === "registrar") {
      const modal = new ModalBuilder()
        .setCustomId("modalRegistro")
        .setTitle("🧾 Registro da Mecânica");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("nome")
            .setLabel("Nome e Sobrenome")
            .setPlaceholder("Ex: Clayton Silva")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("id")
            .setLabel("ID")
            .setPlaceholder("Ex: 123")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === "modalRegistro"
    ) {
      const nome = interaction.fields.getTextInputValue("nome");
      const id = interaction.fields.getTextInputValue("id");

      if (!interaction.member.manageable) {
        return interaction.reply({
          content: "❌ Não posso alterar seu nickname. Avise um supervisor.",
          flags: 64
        });
      }

      const nick = `[Mec. Jr] ${nome} | ${id}`;
      await interaction.member.setNickname(nick);

      const embedLog = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setTitle("🆕 Novo Registro")
        .addFields(
          { name: "👤 Membro", value: interaction.user.tag, inline: true },
          { name: "🧾 Registro", value: nick, inline: true }
        )
        .setTimestamp();

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      log.send({ embeds: [embedLog] });

      return interaction.reply({
        content: "✅ Registro concluído com sucesso!",
        flags: 64
      });
    }

    // ===== PROMOÇÃO =====
    if (interaction.isButton() && interaction.customId === "abrir_promocao") {
      if (interaction.channel.id !== PROMOCAO_CHANNEL_ID) {
        return interaction.reply({
          content: "❌ Use este painel apenas no canal correto.",
          flags: 64
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("modalPromocao")
        .setTitle("📈 Promoção de Membro");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("userId")
            .setLabel("ID do Usuário")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("cargo")
            .setLabel("Novo Cargo")
            .setPlaceholder("Ex: Mec., Supervisor")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === "modalPromocao"
    ) {
      const userId = interaction.fields.getTextInputValue("userId");
      const cargo = interaction.fields.getTextInputValue("cargo");

      const membro = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!membro || !membro.manageable) {
        return interaction.reply({
          content: "❌ Não posso promover este membro.",
          flags: 64
        });
      }

      const nickAtual = membro.nickname || membro.user.username;
      const nomeLimpo = nickAtual.replace(/\[.*?\]\s*/g, "");
      const novoNick = `[${cargo}] ${nomeLimpo}`;

      await membro.setNickname(novoNick);

      const embedLog = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle("📈 Promoção Realizada")
        .addFields(
          { name: "👤 Membro", value: membro.user.tag, inline: true },
          { name: "⬆️ Novo Cargo", value: novoNick, inline: true }
        )
        .setTimestamp();

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      log.send({ embeds: [embedLog] });

      return interaction.reply({
        content: "🚀 Promoção aplicada com sucesso!",
        flags: 64
      });
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({
        content: "❌ Erro inesperado.",
        flags: 64
      });
    }
  }
});

// ================= LOGIN =================
client.login(TOKEN);
