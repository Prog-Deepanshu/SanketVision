import React from "react"
import handImages from "../public/handImages.svg"
import {
  Text,
  Button,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Link,
} from "@chakra-ui/react"

export default function About() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <div>
      <Button onClick={onOpen} colorScheme="orange">
        Learn More
      </Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>American Sign Language (ASL)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm">
              Sanket Vision is a basic ASL (Ameican Sign Language) detector which 
              uses tensorflow.js to detect the hand signs. The model is made in order 
              help people learn Sign Language and also, interact in a better way with
              the deaf.
            </Text>
            <Image src={handImages} />
            <Text fontSize="sm">
              CREATOR - Deepanshu Jha{" "}
              <Link
                href="https://github.com/prog-deepanshu"
                isExternal
                color="orange.300"
              >
                Github Profile
              </Link>
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
