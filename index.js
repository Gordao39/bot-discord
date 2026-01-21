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

// IMAGEM DIRETA (SEM PARÂMETROS)
const IMAGEM_REGISTRO =
  "https://cdn.discordapp.com/attachments/946413761416282152/1461839050263756961/logo_mec_sem_fundo_londres.png";
// =========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= FUNÇÃO LIMPAR PAINEL =================
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

// ================= PAINEL PROMOÇÃO =================
async function enviarPainelPromocao() {
  const canal = await client.channels.fetch(PROMOCAO_CHANNEL_ID);
  await limparPainel(PROMOCAO_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle("📈 Painel de Promoção da Mecânica")
    .setDescription(
      "⬆️ Utilize este painel para promover membros.\n\n" +
      "📛 O nickname será atualizado automaticamente.\n\n" +
      "🔓 Apenas quem tem acesso a este canal pode usar."
    )
    .setFooter({ text: "Gestão da Mecânica • RP" });

  const botao = new ButtonBuilder()
    .setCustomId("promover")
    .setLabel("Promover Membro")
    .setEmoji("⬆️")
    .setStyle(ButtonStyle.Primary);

  await canal.send({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(botao)]
  });
}

// ================= READY =================
client.once("clientReady", async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);

  await enviarPainelRegistro();
  await enviarPainelPromocao();
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

    // ===== BOTÃO PROMOÇÃO =====
    if (interaction.isButton() && interaction.customId === "promover") {
      if (interaction.channel.id !== PROMOCAO_CHANNEL_ID) {
        return interaction.reply({
          content: "❌ Use este botão apenas no canal de promoção.",
          flags: 64
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("modalPromocao")
        .setTitle("📈 Promoção da Mecânica");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("userId")
            .setLabel("ID do usuário (Discord)")
            .setPlaceholder("Ex: 545692083336249350")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("cargo")
            .setLabel("Novo cargo (ex: Mec., Supervisor)")
            .setPlaceholder("Ex: Mec.")
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

      let membro;
      try {
        membro = await interaction.guild.members.fetch(userId);
      } catch {
        return interaction.reply({
          content: "❌ Usuário não encontrado.",
          flags: 64
        });
      }

      if (!membro.manageable) {
        return interaction.reply({
          content: "❌ Não posso alterar o nickname desse membro.",
          flags: 64
        });
      }

      const nickAtual = membro.nickname || membro.user.username;
      const nomeLimpo = nickAtual.replace(/^\[.*?\]\s*/, "");
      const novoNick = `[${cargo}] ${nomeLimpo}`;

      await membro.setNickname(novoNick);

      const log = await client.channels.fetch(LOG_CHANNEL_ID);
      await log.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xf1c40f)
            .setTitle("📈 Promoção Realizada")
            .addFields(
              { name: "👤 Membro", value: membro.user.tag },
              { name: "🏷️ Novo Nick", value: novoNick },
              { name: "👮 Promovido por", value: interaction.user.tag }
            )
            .setTimestamp()
        ]
      });

      return interaction.reply({
        content: `✅ Promoção realizada com sucesso!\n${novoNick}`,
        flags: 64
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
