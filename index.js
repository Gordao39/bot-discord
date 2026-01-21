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
const LOG_CHANNEL_ID = "1463289165985878128";

// IMAGEM DIRETA (SEM ?ex=)
const IMAGEM_REGISTRO =
  "https://cdn.discordapp.com/attachments/946413761416282152/1461839050263756961/logo_mec_sem_fundo_londres.png";

// =========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= FUNÇÃO LIMPA PAINEL =================
async function limparPainel(channelId) {
  const canal = await client.channels.fetch(channelId);
  const mensagens = await canal.messages.fetch({ limit: 20 });

  const botMsgs = mensagens.filter(
    m => m.author.id === client.user.id
  );

  for (const msg of botMsgs.values()) {
    await msg.delete().catch(() => {});
  }
}

// ================= PAINEL REGISTRO =================
async function enviarPainelRegistro() {
  const canal = await client.channels.fetch(REGISTRO_CHANNEL_ID);

  await limparPainel(REGISTRO_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setColor(0x00b894)
    .setTitle("🔧 Registro da Mecânica")
    .setDescription(
      "**Bem-vindo à Mecânica!**\n\n" +
      "📋 Clique no botão abaixo para realizar seu registro.\n\n" +
      "🧾 Informe corretamente:\n" +
      "• Nome e sobrenome RP\n" +
      "• Seu ID\n\n" +
      "⚠️ Informações incorretas podem gerar punições."
    )
    .setFooter({ text: "Sistema da Mecânica • RP" });

  const botao = new ButtonBuilder()
    .setCustomId("registrar")
    .setLabel("Fazer Registro")
    .setEmoji("🧾")
    .setStyle(ButtonStyle.Success);

  await canal.send({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(botao)]
  });
}

// ================= READY =================
client.once("clientReady", async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  await enviarPainelRegistro();
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

      if (!interaction.member.manageable) {
        return interaction.reply({
          content: "❌ Não tenho permissão para alterar seu nickname.",
          flags: 64
        });
      }

      const nome = interaction.fields.getTextInputValue("nome");
      const id = interaction.fields.getTextInputValue("id");

      const nick = `[Mec. Jr] ${nome} | ${id}`;
      await interaction.member.setNickname(nick);

      // ===== LOG =====
      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      await log.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x0984e3)
            .setTitle("🆕 Novo Registro")
            .addFields(
              { name: "👤 Usuário", value: interaction.user.tag },
              { name: "🧾 Nickname", value: nick }
            )
            .setTimestamp()
        ]
      });

      // ===== EMBED FINAL COM IMAGEM (MENSAGEM NORMAL) =====
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("🎉 Registro Concluído!")
            .setDescription(
              `Parabéns **${nome}**!\n\n` +
              "🔧 Você agora faz parte da **Mecânica**.\n" +
              "📋 Bom trabalho!"
            )
            .setImage(IMAGEM_REGISTRO)
            .setFooter({ text: "Mecânica RP • Seja bem-vindo!" })
        ]
      });
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({
        content: "❌ Ocorreu um erro inesperado.",
        flags: 64
      });
    }
  }
});

// ================= LOGIN =================
client.login(TOKEN);
