import { useState, useCallback } from "react";

export const useTextHighlight = () => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Função auxiliar para remover as tags de destaque de forma limpa
  const removeHighlights = (container: HTMLElement) => {
    const marks = container.querySelectorAll("mark.highlight");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        const textContent = mark.textContent || "";
        const textNode = document.createTextNode(textContent);
        parent.replaceChild(textNode, mark);
      }
    });
    // Junta novamente os nós de texto que foram divididos
    container.normalize();
  };

  const highlightText = useCallback((text: string, containerId: string = "law-content", preventScroll = false, preventFadeOut = false) => {
    if (!text) return false;
    const container = document.getElementById(containerId);
    if (!container) return false;

    // Remove destaques anteriores no DOM
    removeHighlights(container);

    // Busca recursivamente nos nós de texto para aplicar o realce
    const walkAndHighlight = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeText = node.nodeValue || "";
        const index = nodeText.toLowerCase().indexOf(text.toLowerCase());
        
        if (index !== -1) {
          const matchText = nodeText.substring(index, index + text.length);
          const beforeText = nodeText.substring(0, index);
          const afterText = nodeText.substring(index + text.length);

          const fragment = document.createDocumentFragment();
          if (beforeText) {
            fragment.appendChild(document.createTextNode(beforeText));
          }

          const mark = document.createElement("mark");
          mark.className = "highlight";
          mark.appendChild(document.createTextNode(matchText));
          fragment.appendChild(mark);

          if (afterText) {
            fragment.appendChild(document.createTextNode(afterText));
          }

          node.parentNode?.replaceChild(fragment, node);
          
          // Scroll suave até a marcação se estiver disponível no ambiente
          if (!preventScroll && typeof mark.scrollIntoView === "function") {
            mark.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          
          // Adiciona classe para transição suave de fade-out após delay
          if (!preventFadeOut) {
            setTimeout(() => {
              mark.classList.add("fade-out");
            }, 50);
          }

          return true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // Evita processar outros marks, scripts ou estilos
        if (element.tagName !== "MARK" && element.tagName !== "SCRIPT" && element.tagName !== "STYLE") {
          const children = Array.from(node.childNodes);
          for (const child of children) {
            if (walkAndHighlight(child)) return true;
          }
        }
      }
      return false;
    };

    const success = walkAndHighlight(container);
    if (success) {
      setIsHighlighted(true);
      return true;
    }
    
    setIsHighlighted(false);
    return false;
  }, []);

  const clearHighlight = useCallback(() => {
    const container = document.getElementById("law-content");
    if (!container) return;

    removeHighlights(container);
    setIsHighlighted(false);
  }, []);

  return { highlightText, clearHighlight, isHighlighted };
};
