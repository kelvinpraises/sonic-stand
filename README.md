# SonicStand

<div align="center">
  <img src="https://sonicstand.vercel.app/logo-dark.png" alt="SonicStand Logo" width="300">

📖 [Documentation](#) | 🎯 [Demo](https://sonicstand.vercel.app/) | 🔗 [Network Dashboard](https://sonicstand.vercel.app/console)

</div>

## 🌟 Overview

SonicStand reimagines decentralized curation through an Agentic DePIN network powered by VISE (Video Indexing & Sequencing Engine). Our solution achieves three core objectives:

1. **Narrative Balance**: Bridges traditional crypto values with modern agentic AI trends
2. **Onchain Participation**: Enables HTML5-capable devices to join a decentralized compute network
3. **Token Utility Proof**: Demonstrates real-world value for agent tokens through verifiable video insights

Built for the Sonic DeFAI Hackathon, SonicStand transforms video content into immutable, explorable knowledge graphs while maintaining computational inclusivity through our HTML5-first approach.

## ✨ Features

- 🌐 Decentralized Compute Network
- 📹 HTML5-Compatible VISE Engine
- 🔍 Agentic Insight Discovery
- 🔗 Onchain Data Integrity
- 🤖 Autonomous Curation Agents
- 📈 Tokenized Contribution Rewards

## 🚀 Technical Architecture

```mermaid
graph TD
    %% Presentation Layer
    subgraph "Presentation Layer"
        UI_Home["Next.js UI - Home Page"]
        UI_Explore["Next.js UI - Explore Page"]
        UI_Console["Next.js UI - Console Page"]
        UI_NodLay["Console Layout"]
        UI_Layout["Global Layout"]
        LibComponents["Component Library"]
        LibHooks["UI Hooks"]
        LibProviders["UI Providers"]
    end

    %% API Backend Service
    subgraph "API Backend Service"
        API_Indexing["Indexing Endpoint"]
        API_Key["Key Endpoint"]
        API_Metadata["Metadata Endpoint"]
        API_Search["Search Endpoint"]
    end

    %% Decentralized Compute/VISE Network Layer
    subgraph "Decentralized Compute/VISE Network"
        Device["HTML5 Devices"]
        DSP["Distributed Video Processing"]
        Agent["Agentic Insight Generation"]
        Onchain["Onchain Data Hashing"]
        KG["Decentralized Knowledge Graph"]
    end

    %% Blockchain / Smart Contract Layer
    subgraph "Blockchain / Smart Contract Layer"
        SmartContracts["Smart Contracts"]
    end

    %% Relationships: Presentation Layer -> API Backend Service
    UI_Layout -->|"calls"| API_Indexing
    UI_Layout -->|"calls"| API_Key
    UI_Layout -->|"calls"| API_Metadata
    UI_Layout -->|"calls"| API_Search

    %% Relationships: API to Decentralized Compute/VISE Network
    API_Indexing -->|"submits"| Device

    %% Decentralized Compute Flow
    Device -->|"processes"| DSP
    DSP -->|"analyzes"| Agent
    Agent -->|"hashes"| Onchain
    Onchain -->|"assembles"| KG

    %% Relationship: Compute to Blockchain
    KG -->|"records"| SmartContracts

    %% Additional relationship to reflect data retrieval from compute network
    API_Metadata -->|"queries"| KG

    %% Click Events for Presentation Layer
    click UI_Home "https://github.com/kelvinpraises/sonic-stand/blob/main/app/(home)/page.tsx"
    click UI_Explore "https://github.com/kelvinpraises/sonic-stand/blob/main/app/(home)/explore/page.tsx"
    click UI_Console "https://github.com/kelvinpraises/sonic-stand/blob/main/app/(node)/console/page.tsx"
    click UI_NodLay "https://github.com/kelvinpraises/sonic-stand/blob/main/app/(node)/layout.tsx"
    click UI_Layout "https://github.com/kelvinpraises/sonic-stand/blob/main/app/layout.tsx"
    click LibComponents "https://github.com/kelvinpraises/sonic-stand/tree/main/library/components"
    click LibHooks "https://github.com/kelvinpraises/sonic-stand/tree/main/library/hooks"
    click LibProviders "https://github.com/kelvinpraises/sonic-stand/tree/main/library/providers"

    %% Click Events for API Backend Service
    click API_Indexing "https://github.com/kelvinpraises/sonic-stand/blob/main/app/api/indexing/route.ts"
    click API_Key "https://github.com/kelvinpraises/sonic-stand/blob/main/app/api/key/route.ts"
    click API_Metadata "https://github.com/kelvinpraises/sonic-stand/blob/main/app/api/metadata/route.ts"
    click API_Search "https://github.com/kelvinpraises/sonic-stand/blob/main/app/api/search/route.ts"

    %% Click Event for Blockchain / Smart Contract Layer
    click SmartContracts "https://github.com/kelvinpraises/sonic-stand/tree/main/contracts"

    %% Styles
    class UI_Home,UI_Explore,UI_Console,UI_NodLay,UI_Layout,LibComponents,LibHooks,LibProviders frontend
    class API_Indexing,API_Key,API_Metadata,API_Search api
    class Device,DSP,Agent,Onchain,KG compute
    class SmartContracts blockchain

    %% Class Definitions with Colors
    classDef frontend fill:#D1E8FF,stroke:#1A4F7A,stroke-width:2px;
    classDef api fill:#FFF2CC,stroke:#D6A300,stroke-width:2px;
    classDef compute fill:#D0F0C0,stroke:#4CAF50,stroke-width:2px;
    classDef blockchain fill:#FADBD8,stroke:#E74C3C,stroke-width:2px;
```

## 🎯 Use Cases

- 🔬 Onchain Researchers: Discover verifiable video insights
- 📡 Network Participants: Contribute compute resources
- 🛡️ Data Custodians: Curate immutable content records
- 🤖 AI Developers: Train models on decentralized datasets

## 📄 License

Distributed under the MIT License.

## 🏆 Hackathon Track

This project was built for the **Sonic DeFAI Hackathon**, emphasizing:

- Agentic DePIN Infrastructure
- Decentralized Video Intelligence
- Computational Inclusivity
- Immutable Content Provenance

## 👥 Team

- [Kelvin Praises](https://x.com/kelvinpraises) - Protocol Design ✘ Agent Architecture ✘ Fullstack Implementation

## 📊 Project Status

- [x] Core VISE Engine
- [x] HTML5 Compute Integration
- [x] Basic Agent Framework
- [x] Token Incentive Layer
- [ ] Advanced Curation DAO
