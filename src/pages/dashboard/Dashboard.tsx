import React, { useContext } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { _firestore } from "../../utils/firebase";
import { UserContext } from "../../providers/AuthProvider";
import { useCollectionData } from "react-firebase-hooks/firestore";

const Dashboard = () => {
  const { actualUser } = useContext(UserContext);
  const toast = useToast();
  const ordersCollectionRef = _firestore
    .collection("/orders")
    .where("restaurantName", "==", actualUser.restaurantName)
    .where("completed", "==", false);

  const [orders] = useCollectionData(ordersCollectionRef);

  const completeOrder = async (docID: string) => {
    await _firestore.collection("/orders").doc(`${docID}`).update({
      completed: true,
    }).then(() => toast({
      title: "Ordine aggiornato come completato",
      isClosable: true,
      duration: 2000,
      position: "top-left",
      status: "success"
    }))
    .catch((error) => {
      console.error(error);
      toast({
        title: "Non è stato possibile aggiornare l'ordine come completato",
        isClosable: true,
        duration: 2000,
        position: "top-left",
        status: "error"
      })
    })
  }
  return (
    <Box p="4" borderRadius="lg" borderWidth="3px">
      <Text>Ordini in arrivo:</Text>
      <Accordion allowToggle>
        {orders ? (
          orders.map((order, id: number) => {
            const {
              allIngredients,
              paymentMethod,
              totale,
              user,
              createdAt,
              userInfos,
            } = order;
            return (
              <>
                <Box p="4" mt="4" borderRadius="lg" borderWidth="3px">
                  <Text>Totale: €{totale}</Text>
                  <Text>Metodo di Pagamento: {paymentMethod}</Text>
                  <Text>
                    Utente: {user} | {userInfos}
                  </Text>
                  <Text>Creato il: {createdAt.toDate().toString()}</Text>
                  <AccordionItem key={id}>
                    <AccordionButton>
                      <Box p="2" textAlign="left">
                        Ingredienti Ordinati
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      {allIngredients.map((item: any, id: number) => {
                        const { name, price, quantity } = item;
                        return (
                          <React.Fragment key={id}>
                            <Text key={id} fontSize="medium">
                              {name} | €{price} - {quantity}g
                            </Text>
                          </React.Fragment>
                        );
                      })}
                    </AccordionPanel>
                    <Button
                      bgColor="green.100"
                      borderRadius="2xl"
                      width="10%"
                      onClick={async () => {
                        _firestore.collection("/orders").where("createdAt", "==", createdAt)
                          .get()
                          .then((qs) => qs.forEach((doc) => completeOrder(doc.id)))
                          .catch(console.error);

                      }}
                    >
                      Completa
                    </Button>
                  </AccordionItem>
                </Box>
              </>
            );
          })
        ) : (
          <Text opacity="0.2">Nessun ordine!</Text>
        )}
      </Accordion>
    </Box>
  );
};

export default Dashboard;
