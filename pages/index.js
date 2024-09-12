import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "../components/handposeutil";
import * as fp from "fingerpose";
import Handsigns from "../components/handsigns";
import {
  Text,
  Heading,
  Button,
  Image,
  Stack,
  Container,
  Box,
  VStack,
  ChakraProvider,
} from "@chakra-ui/react";
import { Signimage, Signpass } from "../components/handimage";
import About from "../components/about";
import Metatags from "../components/metatags";
import { RiCameraFill, RiCameraOffFill } from "react-icons/ri";

export default function Home() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [camState, setCamState] = useState("on");
  const [sign, setSign] = useState(null);
  const [spokenText, setSpokenText] = useState("");
  const [speechMode, setSpeechMode] = useState(false); // State for speech-to-text mode
  const [showCaption, setShowCaption] = useState(false); // State for showing/hiding caption box

  let signList = [];
  let currentSign = 0;
  let gamestate = "started";

  async function runHandpose() {
    const net = await handpose.load();
    _signList();
    setInterval(() => {
      detect(net);
    }, 150);
  }

  function _signList() {
    signList = generateSigns();
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateSigns() {
    const password = shuffle(Signpass);
    return password;
  }

  async function detect(net) {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.ThumbsUpGesture,
          Handsigns.aSign,
          Handsigns.bSign,
          Handsigns.cSign,
          Handsigns.dSign,
          Handsigns.eSign,
          Handsigns.fSign,
          Handsigns.gSign,
          Handsigns.hSign,
          Handsigns.iSign,
          Handsigns.jSign,
          Handsigns.kSign,
          Handsigns.lSign,
          Handsigns.mSign,
          Handsigns.nSign,
          Handsigns.oSign,
          Handsigns.pSign,
          Handsigns.qSign,
          Handsigns.rSign,
          Handsigns.sSign,
          Handsigns.tSign,
          Handsigns.uSign,
          Handsigns.vSign,
          Handsigns.wSign,
          Handsigns.xSign,
          Handsigns.ySign,
          Handsigns.zSign,
        ]);

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5);

        if (gamestate === "started") {
          document.querySelector("#app-title").innerText =
            "Make a 👍 gesture with your hand to start";
        }

        if (
          estimatedGestures.gestures !== undefined &&
          estimatedGestures.gestures.length > 0
        ) {
          const confidence = estimatedGestures.gestures.map(p => p.confidence);
          const maxConfidence = confidence.indexOf(
            Math.max.apply(undefined, confidence)
          );

          if (
            estimatedGestures.gestures[maxConfidence].name === "thumbs_up" &&
            gamestate !== "played"
          ) {
            _signList();
            gamestate = "played";
            document.getElementById("emojimage").classList.add("play");
            document.querySelector(".tutor-text").innerText =
              "make a hand gesture based on letter shown below";
          } else if (gamestate === "played") {
            document.querySelector("#app-title").innerText = "";

            if (currentSign === signList.length) {
              _signList();
              currentSign = 0;
              return;
            }

            if (
              typeof signList[currentSign].src.src === "string" ||
              signList[currentSign].src.src instanceof String
            ) {
              document
                .getElementById("emojimage")
                .setAttribute("src", signList[currentSign].src.src);
              if (
                signList[currentSign].alt ===
                estimatedGestures.gestures[maxConfidence].name
              ) {
                currentSign++;
              }
              setSign(estimatedGestures.gestures[maxConfidence].name);
            }
          } else if (gamestate === "finished") {
            return;
          }
        }
      }
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  }

  useEffect(() => {
    runHandpose();
  }, []);

  const handleSpeechToText = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
      
    if (!SpeechRecognition) {
      alert("Speech Recognition API is not supported in this browser.");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
  
    recognition.onstart = () => {
      setSpeechMode(true); // Set speech mode to true when recognition starts
    };
  
    recognition.onend = () => {
      setSpeechMode(false); // Set speech mode to false when recognition ends
      setShowCaption(true); // Show the caption box when speech ends
      
      // Hide the caption box after 5 seconds
      setTimeout(() => {
        setShowCaption(false);
      }, 5000);
    };
  
    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript.toLowerCase();
      setSpokenText(speech); // Update spoken text to be displayed
  
      // Process commands
      if (speech.includes("turn off camera")) {
        setCamState("off");
      } else if (speech.includes("turn on camera")) {
        setCamState("on");
      } else if (speech.includes("start game")) {
        gamestate = "started";
      } else if (speech.includes("stop game")) {
        gamestate = "stopped";
      }
    };
  
    recognition.start();
  };

  function turnOffCamera() {
    setCamState(prevState => (prevState === "on" ? "off" : "on"));
  }

  return (
    <ChakraProvider>
      <Metatags />
      <Box bgColor="#5784BA" position="relative" height="100vh">
        <Container centerContent maxW="xl" height="100%" pt="0" pb="0">
          <VStack spacing={4} align="center">
            <Box h="20px"></Box>
            <Heading
              as="h3"
              size="md"
              className="tutor-text"
              color="white"
              textAlign="center"
            ></Heading>
            <Box h="20px"></Box>
          </VStack>

          <Heading
            as="h1"
            size="lg"
            id="app-title"
            color="white"
            textAlign="center"
          >
            🧙‍♀️ Loading the Magic 🧙‍♂️
          </Heading>

          <Box id="webcam-container" position="relative" width="100%" height="100%">
            {camState === "on" ? (
              <Webcam id="webcam" ref={webcamRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
            ) : (
              <div id="webcam" style={{ background: "black", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}></div>
            )}

            {sign ? (
              <div
                style={{
                  position: "absolute",
                  marginLeft: "auto",
                  marginRight: "auto",
                  right: "calc(50% - 50px)",
                  bottom: 100,
                  textAlign: "-webkit-center",
                  zIndex: 10, // Ensure this is above other content
                }}
              >
                <Text color="white" fontSize="sm" mb={1}>
                  detected gestures
                </Text>
                <img
                  alt="signImage"
                  src={
                    Signimage[sign]?.src
                      ? Signimage[sign].src
                      : "/loveyou_emoji.svg"
                  }
                  style={{
                    height: 30,
                  }}
                />
              </div>
            ) : null}
          </Box>

          <canvas id="gesture-canvas" ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }} />

          <Image h="150px" objectFit="cover" id="emojimage" style={{ zIndex: 10 }} />

          <Stack id="start-button" spacing={4} direction="row" align="center" mt={4}>
            <Button
              leftIcon={camState === "on" ? <RiCameraFill size={20} /> : <RiCameraOffFill size={20} />}
              onClick={turnOffCamera}
              colorScheme="orange"
            >
              Camera
            </Button>
            <Button
              onClick={handleSpeechToText}
              colorScheme="blue"
              ml={4}
            >
              {speechMode ? "Stop Speech Recognition" : "Start Speech Recognition"}
            </Button>
            <About />
          </Stack>
          
          {/* Box to display spoken text */}
          {showCaption && (
            <Box bgColor="rgba(0, 0, 0, 0.6)" p={4} borderRadius="md" position="absolute" bottom={4} left={4} width="auto" maxWidth="400px" zIndex={3} overflowWrap="break-word">
              <Text color="white" fontSize="lg">
                {spokenText ? `You said: ${spokenText}` : "Speak something to see the text here."}
              </Text>
            </Box>
          )}
        </Container>
      </Box>
    </ChakraProvider>
  );
}
