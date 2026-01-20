
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
const REGISTRO_CHANNEL_ID = "1082824968313774109";
const PROMOCAO_CHANNEL_ID = "1082824968313774107";
const LOG_CHANNEL_ID = "1082824968611561503";
// ================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= FUNÇÃO DE REGISTRO =================
async function enviarBotaoRegistro() {
  const registroChannel = await client.channels.fetch(REGISTRO_CHANNEL_ID);

  const registroBtn = new ButtonBuilder()
    .setCustomId("registrar")
    .setLabel("📋 Fazer Registro")
    .setStyle(ButtonStyle.Primary);

  await registroChannel.send({
    content: "👋 Clique para registrar seu nome na mecânica",
    components: [new ActionRowBuilder().addComponents(registroBtn)]
  });
}

// ================= FUNÇÃO DE PROMOÇÃO =================
async function enviarBotaoPromocao() {
  const promoChannel = await client.channels.fetch(PROMOCAO_CHANNEL_ID);

  const promoBtn = new ButtonBuilder()
    .setCustomId("abrir_promocao")
    .setLabel("📈 Promover Membro")
    .setStyle(ButtonStyle.Success);

  await promoChannel.send({
    content: "📌 **Painel de Promoção da Mecânica**",
    components: [new ActionRowBuilder().addComponents(promoBtn)]
  });
}

// ================= READY =================
client.once("ready", async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);

  // Envia botão de registro apenas uma vez
  await enviarBotaoRegistro();

  // Envia botão de promoção
  await enviarBotaoPromocao();
});

// ================= INTERAÇÕES =================
client.on("interactionCreate", async interaction => {
  try {
    // ---------- REGISTRO ----------
    if (interaction.isButton() && interaction.customId === "registrar") {
      const modal = new ModalBuilder()
        .setCustomId("modalRegistro")
        .setTitle("Registro Mecânica");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("nome")
            .setLabel("Nome e Sobrenome")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("id")
            .setLabel("ID")
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

      const nick = `[Mec. Jr] ${nome} | ${id}`;
      await interaction.member.setNickname(nick);

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      log.send(`🆕 Registro: **${nick}**`);

      await interaction.reply({
        content: "🎉 Registro concluído com sucesso!",
        ephemeral: true
      });
    }

    // ---------- PROMOÇÃO ----------
    if (interaction.isButton() && interaction.customId === "abrir_promocao") {
      if (interaction.channel.id !== PROMOCAO_CHANNEL_ID) {
        return interaction.reply({
          content: "❌ Use este botão apenas no canal de promoções.",
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("modalPromocao")
        .setTitle("Promoção Mecânica");

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
            .setLabel("Novo Cargo (ex: Mec., Supervisor)")
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

      let membro;
      try {
        membro = await interaction.guild.members.fetch(userId);
      } catch {
        return interaction.reply({
          content: "❌ Usuário não encontrado.",
          ephemeral: true
        });
      }

      const nickAtual = membro.nickname || membro.user.username;
      const nomeComId = nickAtual.replace(/\[.*?\]\s*/g, "");
      const novoNick = `[${cargo}] ${nomeComId}`;

      await membro.setNickname(novoNick);

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      log.send(`📈 Promoção: **${novoNick}**`);

      await interaction.reply({
        content: `✅ Promoção realizada: **${novoNick}**`,
        ephemeral: true
      });
    }
  } catch (err) {
    console.error(err);
    if (interaction.replied === false)
      interaction.reply({ content: "❌ Ocorreu um erro.", ephemeral: true });
  }
});

// ================= LOGIN =================
client.login(TOKEN);

// ================= FUNÇÃO PARA DESBLOQUEAR REGISTRO PELO SCRIPT =================
// Você pode chamar essa função em qualquer ponto do script ou via comando
// Exemplo: enviarBotaoRegistro();
