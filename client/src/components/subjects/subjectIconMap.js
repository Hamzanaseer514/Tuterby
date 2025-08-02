import React from 'react';
import { 
    Sigma, Edit3, FlaskConical, Cpu, Globe2, Briefcase, MessageCircle, Palette, Scale, 
    ShieldQuestion, Database, Brain, FileSpreadsheet, Users2, Layers, Code2, 
    GitBranch, Workflow, Target, Users, Lightbulb, DollarSign, PenTool, BookOpen, Award 
} from 'lucide-react';

export const iconMap = {
    Mathematics: Sigma,
    English: Edit3,
    Science: FlaskConical,
    ComputerScience: Cpu,
    Humanities: Globe2,
    Business: Briefcase,
    Languages: MessageCircle,
    CreativeArts: Palette,
    Law: Scale,
    SoftwareEngineering: Code2,
    AI: Brain,
    Cybersecurity: ShieldQuestion,
    DataScience: Database,
    AccountingFinance: FileSpreadsheet,
    Management: Users2,
    Economics: DollarSign,
    Programming: Code2,
    DataStructures: GitBranch,
    Agile: Workflow,
    WebDev: Globe2,
    MobileDev: Cpu,
    OOP: Layers,
    HCI: Users,
    OS: Cpu,
    Networks: GitBranch,
    Cloud: Layers,
    Testing: Target,
    DevOps: Workflow,
    MachineLearning: Brain,
    NLP: MessageCircle,
    Robotics: Briefcase, 
    BigData: Database,
    InfoSec: ShieldQuestion,
    Cryptography: ShieldQuestion, 
    Marketing: Lightbulb,
    HRM: Users2,
    Operations: Workflow,
    Strategy: Target,
    Entrepreneurship: Lightbulb,
    Leadership: Users,
    SupplyChain: Workflow,
    Investment: DollarSign,
    Taxation: FileSpreadsheet,
    Auditing: PenTool,
    ContractLaw: Scale,
    CriminalLaw: Scale, 
    PropertyLaw: Globe2,
    CommercialLaw: Briefcase,
    IPLaw: Lightbulb,
    HRlaw: Users2,
    IB: BookOpen,
    BTEC: Award,
    TheoryOfKnowledge: Brain,
    ExtendedEssay: Edit3,
    HealthSocialCare: Users,
    IT: Cpu,
    Engineering: Sigma,
    Sport: Target,
    Default: Layers,
};

export const defaultIcon = Layers;

export const getIcon = (subjectName) => {
    const simplifiedName = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key in iconMap) {
        if (simplifiedName.includes(key.toLowerCase())) {
            return iconMap[key];
        }
    }
    if (simplifiedName.includes('math')) return Sigma;
    if (simplifiedName.includes('english')) return Edit3;
    if (simplifiedName.includes('science') || simplifiedName.includes('biolog') || simplifiedName.includes('chemist') || simplifiedName.includes('physic')) return FlaskConical;
    if (simplifiedName.includes('computer') || simplifiedName.includes('software') || simplifiedName.includes('program') || simplifiedName.includes('coding')) return Cpu;
    if (simplifiedName.includes('history') || simplifiedName.includes('geograph') || simplifiedName.includes('politic')) return Globe2;
    if (simplifiedName.includes('business') || simplifiedName.includes('management') || simplifiedName.includes('leader')) return Briefcase;
    if (simplifiedName.includes('language') || simplifiedName.includes('french') || simplifiedName.includes('spanish')) return MessageCircle;
    if (simplifiedName.includes('art') || simplifiedName.includes('design') || simplifiedName.includes('music') || simplifiedName.includes('drama')) return Palette;
    if (simplifiedName.includes('law') || simplifiedName.includes('legal')) return Scale;
    if (simplifiedName.includes('account') || simplifiedName.includes('financ')) return FileSpreadsheet;
    if (simplifiedName.includes('econom')) return DollarSign;
    if (simplifiedName.includes('psycho') || simplifiedName.includes('socio')) return Users;
    if (simplifiedName.includes('ib') || simplifiedName.includes('internationalbaccalaureate')) return iconMap.IB;
    if (simplifiedName.includes('btec')) return iconMap.BTEC;

    return defaultIcon;
};