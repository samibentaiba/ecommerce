import { POST } from "../upload";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    productImage: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const prisma = require("@/lib/prisma").default;

describe("Image Upload API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should store image binary and return id and url", async () => {
    const mockImage = { id: "img-1" };
    (prisma.productImage.create as jest.Mock).mockResolvedValue(mockImage);
    (prisma.productImage.update as jest.Mock).mockResolvedValue({
      ...mockImage,
      url: "/api/images/img-1",
    });
    const fakeFile = {
      arrayBuffer: async () => Buffer.from("test"),
      name: "test.png",
      type: "image/png",
    };
    const formData = {
      get: (key: string) => {
        if (key === "file") return fakeFile;
        if (key === "alt") return "alt";
        if (key === "isPrimary") return "true";
        return undefined;
      },
    };
    const req = { formData: async () => formData } as any;
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("img-1");
    expect(data.url).toBe("/api/images/img-1");
    expect(prisma.productImage.create).toHaveBeenCalled();
    expect(prisma.productImage.update).toHaveBeenCalled();
  });

  it("should return 400 if no file uploaded", async () => {
    const formData = {
      get: (key: string) => undefined,
    };
    const req = { formData: async () => formData } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/no file uploaded/i);
  });
});
