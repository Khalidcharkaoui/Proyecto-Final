const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Obtener todos los mensajes
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Crear nuevo mensaje
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Marcar un mensaje como borrado
//@route           PUT /api/Message/mark-as-deleted/:messageId
//@access          Protected
const markMessageAsDeleted = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    // Encuentra el mensaje por el ID
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Mensaje no encontrado" });
    }

    // Verifica si el mensaje pertenece al usuario actual
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "No tienes permisos para eliminar este mensaje" });
    }

    // Cambia el contenido del mensaje a "Este mensaje ha sido eliminado" y marca como "borrado"
    message.content = "Este mensaje ha sido eliminado";
    message.deleted = true;

    // Guarda los cambios
    await message.save();

    res.json({ message: "Mensaje marcado como borrado" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
module.exports = { allMessages, sendMessage, markMessageAsDeleted };
