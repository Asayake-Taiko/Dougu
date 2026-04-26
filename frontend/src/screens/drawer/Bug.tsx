import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../styles/global";

const ladybug = require("../../assets/ladybug.jpg");
const yesImg = require("../../assets/yes.jpg");
const noImg = require("../../assets/no.png");

export default function BugScreen() {
  const [status, setStatus] = useState<"initial" | "yes" | "no">("initial");

  const renderContent = () => {
    switch (status) {
      case "initial":
        return {
          img: ladybug,
          title: "Bug Alert!",
          text: "You've found a bug! But this is a friendly bug and it seems the creator of this bug would like to ask you to dinner. Do you accept?",
        };
      case "yes":
        return {
          img: yesImg,
          title: "Yay!",
          text: "",
        };
      case "no":
        return {
          img: noImg,
          title: "RIP.",
          text: "Well, at least you're honest.",
        };
    }
  };

  const content = renderContent();

  return (
    <View style={styles.container}>
      <Image source={content.img} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.text}>{content.text}</Text>

      {status === "initial" ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.primary }]}
            onPress={() => setStatus("yes")}
          >
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.gray500 }]}
            onPress={() => setStatus("no")}
          >
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.primary }]}
          onPress={() => setStatus("initial")}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    color: Colors.black,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
