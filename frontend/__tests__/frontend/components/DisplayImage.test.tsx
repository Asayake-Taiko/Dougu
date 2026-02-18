import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import DisplayImage from "../../../src/components/DisplayImage";
import { allMappings } from "../../../src/lib/utils/ImageMapping";

// Mock expo-image since it's a native component
jest.mock("expo-image", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Image } = require("react-native");
  return {
    Image: (props: any) => {
      // Render a view with testID for identifying, and pass props to check source
      return <Image {...props} testID="display-image" />;
    },
  };
});

// Mock Supabase client
const mockCreateSignedUrl = jest.fn();
jest.mock("../../../src/lib/supabase/supabase", () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: mockCreateSignedUrl,
      }),
    },
  },
}));

describe("DisplayImage", () => {
  beforeEach(() => {
    mockCreateSignedUrl.mockReset();
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed-url.com" },
      error: null,
    });
  });

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

  it("renders remote URI directly when key is a full URL", async () => {
    const url = "https://example.com/image.png";
    render(<DisplayImage imageKey={url} />);
    const image = await screen.findByTestId("display-image");
    expect(image.props.source).toEqual({ uri: url });
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it("generates signed URL for storage path", async () => {
    const path = "profiles/123/profile.png";
    render(<DisplayImage imageKey={path} />);

    // Should call createSignedUrl
    expect(mockCreateSignedUrl).toHaveBeenCalledWith(path, 3600);

    // Should render the signed URL returned by mock
    await screen.findByTestId("display-image");
    // Wait for effect to update state
    await waitFor(() => {
      expect(screen.getByTestId("display-image").props.source).toEqual({
        uri: "https://signed-url.com",
      });
    });
  });

  it("treats path with slashes as remote URI and signs it", async () => {
    const path = "uploads/123.png";
    render(<DisplayImage imageKey={path} />);

    expect(mockCreateSignedUrl).toHaveBeenCalledWith(path, 3600);
    await waitFor(() => {
      expect(screen.getByTestId("display-image").props.source).toEqual({
        uri: "https://signed-url.com",
      });
    });
  });
});
