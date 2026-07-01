import sys
from pathlib import Path

# Garantir que o diretório raiz do backend esteja no path para importações
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.analysis.scoring import score_analysis
from app.services.analysis_provider import LegalBERTProvider, TAXONOMY


def test_text(texto, titulo):
    print("\n" + "=" * 60)
    print(f"TESTANDO: {titulo}")
    print(f'Texto: "{texto}"')
    print("-" * 60)

    # Inicializa o classificador
    provider = LegalBERTProvider()

    # Exibir de onde o modelo foi carregado (local ou remoto)
    current_dir = Path(__file__).resolve().parent.parent
    local_model_path = current_dir / "app" / "models" / "fine_tuned_legalbert"

    if (local_model_path / "config.json").exists():
        print(f"[*] Modelo CARREGADO LOCALMENTE de: {local_model_path.name}")
    else:
        print(f"[*] Modelo CARREGADO REMOTAMENTE: {provider.model_name}")

    try:
        # Executa inferência
        probs = provider.analyze(texto)

        # Executa a regra de scoring para obter score, metrics e warnings
        scored = score_analysis(probs)

        print("\nResultados da Classificação (Probabilidades):")
        for cat in TAXONOMY:
            prob = probs.get(cat, 0.0)
            bar = "#" * int(prob * 20)
            print(f"  {cat:<18}: [{bar:<20}] {prob * 100:.1f}%")

        print(f"\nScore Geral de Qualidade: {scored['score'] * 100:.1f}%")

        print("\nAvisos (Warnings) Gerados:")
        if scored["warnings"]:
            for warn in scored["warnings"]:
                print(
                    f"  - [{warn['code']}] {warn['message']} (Confiança: {warn['confidence'] * 100:.1f}%)"
                )
        else:
            print("  Nenhum aviso gerado (texto em boa qualidade técnica).")

    except Exception as e:
        print(f"Erro ao analisar o texto: {e}")
    print("=" * 60)


def main():
    print("--- Teste do Classificador LegalBERT-pt ---")

    # Caso o usuário passe argumentos de linha de comando
    if len(sys.argv) > 1:
        texto = " ".join(sys.argv[1:])
        test_text(texto, "Texto fornecido via argumento")
        return

    # Exemplo 1: Texto com vagueza
    texto_vago = (
        "Art. 1º. Os sistemas públicos que utilizam inteligência artificial devem "
        "apresentar relatórios de impacto sempre que possível e viável, a critério "
        "exclusivo da chefia do órgão competente."
    )
    test_text(texto_vago, "Exemplo Vago (REQ-002)")

    # Exemplo 2: Texto sem problemas (Saudável)
    texto_saudavel = (
        "Art. 1º. Fica instituído o Programa de Telemedicina no âmbito do Sistema "
        "Único de Saúde (SUS) para garantir atendimento remoto. Art. 2º. As consultas "
        "virtuais serão agendadas mediante solicitação médica prévia."
    )
    test_text(texto_saudavel, "Exemplo Saudável (REQ-001)")


if __name__ == "__main__":
    main()
