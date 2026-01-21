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

// ============ CONFIG ============
const TOKEN = process.env.DISCORD_TOKEN;

const REGISTRO_CHANNEL_ID = "1463289005813661748";
const PROMOCAO_CHANNEL_ID = "1463289116241432690";
const LOG_CHANNEL_ID = "1463289165985878128";
// ================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= REGISTRO =================
async function enviarBotaoRegistro() {
  const canal = await client.channels.fetch(REGISTRO_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setTitle("🔧 Registro da Mecânica")
    .setDescription(
      "Bem-vindo à mecânica!\n\n" +
      "📋 Clique no botão abaixo para registrar seu **nome e ID**.\n" +
      "⚠️ Certifique-se de preencher corretamente."
    )
    .setColor(0x3498db)
    .setFooter({ text: "Sistema de Registro • Mecânica RP" });

  const botao = new ButtonBuilder()
    .setCustomId("registrar")
    .setLabel("Fazer Registro")
    .setEmoji("📝")
    .setStyle(ButtonStyle.Primary);

  await canal.send({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(botao)]
  });
}

// ================= PROMOÇÃO =================
async function enviarBotaoPromocao() {
  const canal = await client.channels.fetch(PROMOCAO_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setTitle("📈 Painel de Promoções")
    .setDescription(
      "Área exclusiva para promoções internas da mecânica.\n\n" +
      "👤 Informe o **ID do membro**\n" +
      "🏷️ Defina o **novo cargo**"
    )
    .setColor(0x2ecc71)
    .setFooter({ text: "Gestão da Mecânica" });

  const botao = new ButtonBuilder()
    .setCustomId("abrir_promocao")
    .setLabel("Promover Membro")
    .setEmoji("⬆️")
    .setStyle(ButtonStyle.Success);

  await canal.send({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(botao)]
  });
}

// ================= READY =================
client.once("ready", async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  await enviarBotaoRegistro();
  await enviarBotaoPromocao();
});

// ================= INTERAÇÕES =================
client.on("interactionCreate", async interaction => {
  try {

    // ===== BOTÃO REGISTRO =====
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

    // ===== MODAL REGISTRO =====
    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === "modalRegistro"
    ) {
      const nome = interaction.fields.getTextInputValue("nome");
      const id = interaction.fields.getTextInputValue("id");

      const nick = `[Mec. Jr] ${nome} | ${id}`;
      await interaction.member.setNickname(nick);

      const embed = new EmbedBuilder()
        .setTitle("🆕 Novo Registro")
        .setColor(0x3498db)
        .setDescription(`👤 **${nick}**`)
        .setTimestamp();

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      log.send({ embeds: [embed] });

      return interaction.reply({
        content: "✅ **Registro realizado com sucesso!**",
        ephemeral: true
      });
    }

    // ===== BOTÃO PROMOÇÃO =====
    if (interaction.isButton() && interaction.customId === "abrir_promocao") {
      if (interaction.channel.id !== PROMOCAO_CHANNEL_ID) {
        return interaction.reply({
          content: "❌ Este painel só pode ser usado no canal de promoções.",
          ephemeral: true
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

    // ===== MODAL PROMOÇÃO =====
    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === "modalPromocao"
    ) {
      const userId = interaction.fields.getTextInputValue("userId");
      const cargo = interaction.fields.getTextInputValue("cargo");

      const membro = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!membro) {
        return interaction.reply({
          content: "❌ Usuário não encontrado.",
          ephemeral: true
        });
      }

      const nickAtual = membro.nickname || membro.user.username;
      const nomeLimpo = nickAtual.replace(/\[.*?\]\s*/g, "");
      const novoNick = `[${cargo}] ${nomeLimpo}`;

      await membro.setNickname(novoNick);

      const embed = new EmbedBuilder()
        .setTitle("📈 Promoção Realizada")
        .setColor(0x2ecc71)
        .setDescription(`👤 **${novoNick}**`)
        .setTimestamp();

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      log.send({ embeds: [embed] });

      return interaction.reply({
        content: "🚀 **Promoção aplicada com sucesso!**",
        ephemeral: true
      });
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({ content: "❌ Ocorreu um erro inesperado.", ephemeral: true });
    }
  }
});

// ================= LOGIN =================
client.login(TOKEN);
