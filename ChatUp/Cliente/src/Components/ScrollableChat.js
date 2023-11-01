import { DeleteIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { Text } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../Config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const toast = useToast();
  const [deletedMessages, setDeletedMessages] = useState([]);

  const handleDeleteMessage = async (message) => {
    try {
      if (!message) {
        return;
      }
   
      // Verificar si el mensaje fue enviado por el usuario actual
      if (message.sender._id === user._id) {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

         await axios.put(
          `/api/message/mark-as-deleted/${message._id}`,
          null,
          config
        );

        // Actualizar el estado o realizar cualquier otra acción necesaria
        setDeletedMessages([...deletedMessages, message._id]);
      } else {
        toast({
          title: "Error",
          description: "No puedes borrar mensajes de otros usuarios.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id) ? (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer" 
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            ) : null}
         <span
              style={{
                backgroundColor: m.sender._id === user._id ? "#4DB6AC" : "#A657A6",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
              >
              <Text fontSize="xs" color ="blackAlpha.900"> {m.sender.name}: </Text>
              {deletedMessages.includes(m._id) ? "Este mensaje ha sido eliminado"  : m.deleted ? "Este mensaje ha sido eliminado" : m.content}
              {!m.deleted && m.sender._id === user._id && (
  <DeleteIcon
    boxSize={4}
    color="red.500" 
    cursor="pointer"
    onClick={() => handleDeleteMessage(m)}
  />
)}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;