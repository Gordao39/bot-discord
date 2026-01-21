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

// 🔗 IMAGEM DE PARABÉNS (troque pela sua)
const IMAGEM_REGISTRO =
  "https://cdn.discordapp.com/attachments/946413761416282152/1461839050263756961/logo_mec_sem_fundo_londres.png?ex=6971f1f5&is=6970a075&hm=3fbfeae8cfb43965c2f7dd1aaab7ebd9a4ec2de5eaca58d6520a78ce339bcee7&"; // exemplo
// =========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= EMBEDS =================
function embedRegistroPainel() {
  return new EmbedBuilder()
    .setColor(0x0fb9b1)
    .setTitle("🔧 Registro da Mecânica")
    .setDescription(
      "**Bem-vindo à mecânica!**\n\n" +
      "🧾 Para iniciar seu trabalho, faça seu **registro oficial**.\n\n" +
      "📌 **Instruções:**\n" +
      "• Nome e sobrenome do RP\n" +
      "• ID correto\n\n" +
      "⚠️ Informações incorretas podem gerar punição."
    )
    .setFooter({ text: "Sistema da Mecânica • RP" });
}

function embedPromocaoPainel() {
  return new EmbedBuilder()
    .setColor(0xf7b731)
    .setTitle("📈 Painel de Promoções")
    .setDescription(
      "**Área restrita da mecânica**\n\n" +
      "⬆️ Promova membros conforme a hierarquia\n" +
      "📋 Use cargos padronizados\n\n" +
      "⚠️ Uso indevido será punido."
    )
    .setFooter({ text: "Gestão da Mecânica • RP" });
}

// ================= BOTÕES =================
async function enviarBotaoRegistro() {
  const canal = await client.channels.fetch(REGISTRO_CHANNEL_ID);

  const botao = new ButtonBuilder()
    .setCustomId("registrar")
    .setLabel("Fazer Registro")
    .setEmoji("🧾")
    .setStyle(ButtonStyle.Success);

  await canal.send({
    embeds: [embedRegistroPainel()],
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
    embeds: [embedPromocaoPainel()],
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
              .setColor(0xe74c3c)
              .setTitle("❌ Erro")
              .setDescription("Não tenho permissão para alterar seu nickname.")
          ],
          flags: 64
        });
      }

      const nome = interaction.fields.getTextInputValue("nome");
      const id = interaction.fields.getTextInputValue("id");

      const nick = `[Mec. Jr] ${nome} | ${id}`;
      await interaction.member.setNickname(nick);

      // 🔔 LOG
      const embedLog = new EmbedBuilder()
        .setColor(0x0fb9b1)
        .setTitle("🆕 Novo Registro")
        .addFields(
          { name: "👤 Usuário", value: interaction.user.tag },
          { name: "🧾 Nickname", value: nick }
        )
        .setTimestamp();

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      log.send({ embeds: [embedLog] });

      // 🎉 EMBED DE PARABÉNS COM IMAGEM
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("🎉 Parabéns!")
            .setDescription(
              `Seja bem-vindo(a) à **Mecânica**!\n\n` +
              `🔧 Agora você faz parte da nossa equipe.\n` +
              `📋 Siga as regras e bom trabalho!`
            )
            .setImage(IMAGEM_REGISTRO)
            .setFooter({ text: "Mecânica RP • Bom trabalho!" })
        ],
        flags: 64
      });
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("❌ Erro Interno")
            .setDescription("Ocorreu um erro inesperado.")
        ],
        flags: 64
      });
    }
  }
});

// ================= LOGIN =================
client.login(TOKEN);
