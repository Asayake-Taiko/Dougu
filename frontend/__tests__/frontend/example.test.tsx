import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";

// Simple example component
const ExampleComponent = ({ message }: { message: string }) => {
  return (
    <View testID="example-container">
      <Text testID="example-text">{message}</Text>
    </View>
  );
};

describe("ExampleComponent", () => {
  it("renders correctly with a message", () => {
    render(<ExampleComponent message="Hello, React Native Testing!" />);

    const textElement = screen.getByTestId("example-text");
    expect(textElement).toBeTruthy();
    expect(textElement.props.children).toBe("Hello, React Native Testing!");
  });

  it("renders the container view", () => {
    render(<ExampleComponent message="Test" />);

    const container = screen.getByTestId("example-container");
    expect(container).toBeTruthy();
  });

  it("can find text by content", () => {
    render(<ExampleComponent message="Find me!" />);

    const textElement = screen.getByText("Find me!");
    expect(textElement).toBeTruthy();
  });
});
