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
const PROMOCAO_CHANNEL_ID = "1463289116241432690";

// 👇 SUA IMAGEM DE BOAS-VINDAS
const IMAGEM_REGISTRO =
  "https://cdn.discordapp.com/attachments/946413761416282152/1461839050263756961/logo_mec_sem_fundo_londres.png";
// =========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= EMBEDS =================
const embedRegistroPainel = new EmbedBuilder()
  .setColor(0x00b894)
  .setTitle("🔧 Registro da Mecânica")
  .setDescription(
    "**Bem-vindo à Mecânica!**\n\n" +
    "📋 Para começar a trabalhar, faça seu registro oficial.\n\n" +
    "🧾 Informe corretamente:\n" +
    "• Nome e sobrenome RP\n" +
    "• Seu ID\n\n" +
    "⚠️ Informações incorretas podem gerar punições."
  )
  .setFooter({ text: "Sistema da Mecânica • RP" });

const embedPromocaoPainel = new EmbedBuilder()
  .setColor(0xfbc531)
  .setTitle("📈 Painel de Promoção")
  .setDescription(
    "**Área restrita da mecânica**\n\n" +
    "⬆️ Utilize para promover membros\n" +
    "📛 Use cargos padronizados\n\n" +
    "⚠️ Mau uso será punido."
  )
  .setFooter({ text: "Gestão da Mecânica • RP" });

// ================= BOTÕES =================
async function enviarBotaoRegistro() {
  const canal = await client.channels.fetch(REGISTRO_CHANNEL_ID);

  const botao = new ButtonBuilder()
    .setCustomId("registrar")
    .setLabel("Fazer Registro")
    .setEmoji("🧾")
    .setStyle(ButtonStyle.Success);

  await canal.send({
    embeds: [embedRegistroPainel],
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
    embeds: [embedPromocaoPainel],
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
          embeds: [
            new EmbedBuilder()
              .setColor(0xe84118)
              .setTitle("❌ Permissão insuficiente")
              .setDescription(
                "Não tenho permissão para alterar seu nickname."
              )
          ],
          flags: 64
        });
      }

      const nome = interaction.fields.getTextInputValue("nome");
      const id = interaction.fields.getTextInputValue("id");

      const nick = `[Mec. Jr] ${nome} | ${id}`;
      await interaction.member.setNickname(nick);

      // ===== LOG =====
      const embedLog = new EmbedBuilder()
        .setColor(0x0984e3)
        .setTitle("🆕 Novo Registro")
        .addFields(
          { name: "👤 Usuário", value: interaction.user.tag },
          { name: "🧾 Nickname", value: nick }
        )
        .setTimestamp();

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      log.send({ embeds: [embedLog] });

      // ===== EMBED COM IMAGEM =====
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("🎉 Registro Concluído!")
            .setDescription(
              `Parabéns **${nome}**!\n` +
              "🔧 Você agora faz parte da **Mecânica**.\n" +
              "📋 Siga as regras e bom trabalho!"
            )
            .setImage(IMAGEM_REGISTRO)
            .setFooter({ text: "Mecânica RP • Bom trabalho!" })
        ],
        flags: 64
      });
    }

  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe84118)
            .setTitle("❌ Erro")
            .setDescription("Ocorreu um erro inesperado.")
        ],
        flags: 64
      });
    }
  }
});

// ================= LOGIN =================
client.login(TOKEN);
