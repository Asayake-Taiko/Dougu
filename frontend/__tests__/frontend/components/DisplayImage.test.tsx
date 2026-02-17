import React from "react";
import { render, screen } from "@testing-library/react-native";
import DisplayImage from "../../../src/components/DisplayImage";
import { allMappings } from "../../../src/lib/utils/ImageMapping";

// Mock expo-image since it's a native component
jest.mock("expo-image", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Image } = require("react-native");
  return {
    Image: (props: any) => {
      return <Image {...props} testID="display-image" />;
    },
  };
});

describe("DisplayImage", () => {
  it("renders default image when no key is provided", () => {
    render(<DisplayImage imageKey={undefined} />);
    const image = screen.getByTestId("display-image");
    expect(image.props.source).toEqual(allMappings["default_image"]);
  });

  it("renders local asset when valid key is provided", () => {
    render(<DisplayImage imageKey="miku" />);
    const image = screen.getByTestId("display-image");
    expect(image.props.source).toEqual(allMappings["miku"]);
  });

  it("renders remote URI when key is a URL", () => {
    const url = "https://example.com/image.png";
    render(<DisplayImage imageKey={url} />);
    const image = screen.getByTestId("display-image");
    expect(image.props.source).toEqual({ uri: url });
  });

  it("treats path with slashes as remote URI", () => {
    const path = "uploads/123.png";
    render(<DisplayImage imageKey={path} />);
    const image = screen.getByTestId("display-image");
    expect(image.props.source).toEqual({ uri: path });
  });
});
