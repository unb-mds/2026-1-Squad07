import { cn } from "@/components/ui/utils";

describe("cn", () => {
  it("retorna a classe quando recebe uma string simples", () => {
    expect(cn("px-4")).toBe("px-4");
  });

  it("une múltiplas classes", () => {
    expect(cn("px-4", "py-2", "text-sm")).toBe("px-4 py-2 text-sm");
  });

  it("resolve conflitos do Tailwind mantendo a última classe", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("ignora valores falsy", () => {
    expect(cn("px-4", undefined, null, false, "py-2")).toBe("px-4 py-2");
  });

  it("aceita objeto de classes condicionais", () => {
    expect(cn({ "px-4": true, "py-2": false })).toBe("px-4");
  });

  it("retorna string vazia quando não recebe argumentos", () => {
    expect(cn()).toBe("");
  });
});
