import asyncio
from datetime import datetime, timezone

from app.db.client import db

DEMO_LAWS = [
    {
        "id": "demo-mobilidade-urbana-2026",
        "title": "[Demonstração] PL 101/2026 - Mobilidade Urbana Sustentável",
        "description": "Proposição fictícia para demonstração do protótipo.",
        "lawNumber": "PL 101/2026",
        "jurisdiction": "Distrito Federal",
        "publicationDate": datetime(2026, 2, 12, tzinfo=timezone.utc),
        "text": (
            "PROJETO DE LEI Nº 101, DE 2026\n\n"
            "Institui diretrizes para mobilidade urbana sustentável no Distrito Federal.\n\n"
            "Art. 1º Fica instituído o Programa de Mobilidade Urbana Sustentável, "
            "com o objetivo de ampliar o acesso ao transporte coletivo e reduzir "
            "emissões decorrentes dos deslocamentos urbanos.\n\n"
            "Art. 2º São diretrizes do programa:\n"
            "I - priorização de corredores de transporte coletivo;\n"
            "II - implantação segura de rotas cicloviárias integradas;\n"
            "III - acessibilidade universal nos pontos de embarque.\n\n"
            "Art. 3º O Poder Executivo publicará relatório anual com indicadores "
            "de cobertura, acessibilidade e redução estimada de emissões."
        ),
    },
    {
        "id": "demo-transparencia-algoritmica-2026",
        "title": "[Demonstração] PL 214/2026 - Transparência Algorítmica",
        "description": "Proposição fictícia para demonstração do protótipo.",
        "lawNumber": "PL 214/2026",
        "jurisdiction": "Nacional",
        "publicationDate": datetime(2026, 3, 4, tzinfo=timezone.utc),
        "text": (
            "PROJETO DE LEI Nº 214, DE 2026\n\n"
            "Estabelece transparência no uso de sistemas automatizados pelo poder público.\n\n"
            "Art. 1º Órgãos públicos que utilizem sistemas automatizados para apoiar "
            "decisões administrativas deverão publicar informações compreensíveis "
            "sobre finalidade, dados utilizados e formas de contestação.\n\n"
            "Art. 2º O cidadão afetado por decisão apoiada por sistema automatizado "
            "terá direito à revisão humana mediante requerimento eletrônico gratuito.\n\n"
            "Art. 3º Informações protegidas por sigilo legal serão resguardadas, "
            "sem prejuízo da justificativa pública sobre os critérios gerais do sistema."
        ),
    },
    {
        "id": "demo-merenda-escolar-2026",
        "title": "[Demonstração] PL 330/2026 - Alimentação Escolar Local",
        "description": "Proposição fictícia para demonstração do protótipo.",
        "lawNumber": "PL 330/2026",
        "jurisdiction": "Goiás",
        "publicationDate": datetime(2026, 3, 27, tzinfo=timezone.utc),
        "text": (
            "PROJETO DE LEI Nº 330, DE 2026\n\n"
            "Dispõe sobre a aquisição de alimentos da agricultura familiar para escolas.\n\n"
            "Art. 1º As escolas da rede estadual priorizarão, observada a legislação "
            "de contratações públicas, a aquisição de alimentos produzidos por "
            "agricultores familiares da região.\n\n"
            "Art. 2º O planejamento do cardápio deverá considerar sazonalidade, "
            "valor nutricional e restrições alimentares comunicadas pelas famílias.\n\n"
            "Art. 3º A Secretaria de Educação divulgará semestralmente os valores "
            "contratados e o percentual adquirido de produtores locais."
        ),
    },
    {
        "id": "demo-dados-saude-2026",
        "title": "[Demonstração] PL 408/2026 - Proteção de Dados em Saúde",
        "description": "Proposição fictícia para demonstração do protótipo.",
        "lawNumber": "PL 408/2026",
        "jurisdiction": "Nacional",
        "publicationDate": datetime(2026, 4, 8, tzinfo=timezone.utc),
        "text": (
            "PROJETO DE LEI Nº 408, DE 2026\n\n"
            "Define práticas mínimas de segurança para prontuários digitais públicos.\n\n"
            "Art. 1º Os sistemas públicos de prontuário eletrônico deverão adotar "
            "controle de acesso individualizado, registro de consulta e proteção "
            "contra acesso não autorizado.\n\n"
            "Art. 2º O paciente poderá solicitar histórico de acessos aos seus dados, "
            "ressalvadas hipóteses legalmente justificadas de proteção a terceiros.\n\n"
            "Art. 3º Incidentes relevantes de segurança deverão ser comunicados aos "
            "afetados em linguagem clara e em prazo compatível com a mitigação do risco."
        ),
    },
    {
        "id": "demo-residuos-eletronicos-2026",
        "title": "[Demonstração] PL 512/2026 - Reciclagem de Eletrônicos",
        "description": "Proposição fictícia para demonstração do protótipo.",
        "lawNumber": "PL 512/2026",
        "jurisdiction": "Minas Gerais",
        "publicationDate": datetime(2026, 4, 19, tzinfo=timezone.utc),
        "text": (
            "PROJETO DE LEI Nº 512, DE 2026\n\n"
            "Cria incentivos para coleta e destinação adequada de resíduos eletrônicos.\n\n"
            "Art. 1º Municípios poderão instituir pontos públicos de entrega voluntária "
            "de aparelhos eletrônicos, pilhas e baterias descartados.\n\n"
            "Art. 2º Fabricantes e comerciantes participantes deverão informar ao "
            "consumidor os pontos de coleta e as condições de descarte seguro.\n\n"
            "Art. 3º O Estado divulgará relatório anual sobre volume coletado, "
            "destinação ambientalmente adequada e ações educativas realizadas."
        ),
    },
    {
        "id": "demo-acessibilidade-digital-2026",
        "title": "[Demonstração] PL 640/2026 - Acessibilidade Digital Pública",
        "description": "Proposição fictícia para demonstração do protótipo.",
        "lawNumber": "PL 640/2026",
        "jurisdiction": "Nacional",
        "publicationDate": datetime(2026, 5, 5, tzinfo=timezone.utc),
        "text": (
            "PROJETO DE LEI Nº 640, DE 2026\n\n"
            "Estabelece requisitos de acessibilidade para serviços públicos digitais.\n\n"
            "Art. 1º Portais e aplicativos mantidos por órgãos públicos deverão ser "
            "compatíveis com tecnologias assistivas e oferecer navegação por teclado.\n\n"
            "Art. 2º Conteúdos audiovisuais essenciais à prestação de serviços deverão "
            "oferecer legendas e alternativas textuais adequadas.\n\n"
            "Art. 3º O órgão responsável disponibilizará canal para comunicação de "
            "barreiras de acessibilidade e divulgará as correções realizadas."
        ),
    },
]


def law_data(law):
    return {
        "title": law["title"],
        "description": law["description"],
        "text": law["text"],
        "sourceType": "USER_UPLOAD",
        "jurisdiction": law["jurisdiction"],
        "lawNumber": law["lawNumber"],
        "publicationDate": law["publicationDate"],
        "isPublic": False,
    }


async def persist_demo_laws():
    created = 0
    updated = 0

    for law in DEMO_LAWS:
        data = law_data(law)
        existing = await db.law.find_unique(where={"id": law["id"]})

        if existing is None:
            await db.law.create(data={"id": law["id"], **data})
            created += 1
        else:
            await db.law.update(where={"id": law["id"]}, data=data)
            updated += 1

    return created, updated


async def main():
    await db.connect()
    try:
        created, updated = await persist_demo_laws()
        print(
            f"Seed demonstrativo concluído: {created} criadas, {updated} atualizadas."
        )
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
