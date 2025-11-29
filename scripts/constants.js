/**
 * ------------------------------------------------------------------
 * MODULE: Constants & Configuration
 * ------------------------------------------------------------------
 */
export const CONSTANTS_INFO = {
    module: "Constants",
    versionName: "Base",
    versionNumber: "1.0.0"
};

export const FACET_ORDER = ['categoria', 'sistema', 'persiana', 'motorizada', 'material', 'folhas'];

export const FACET_DEFINITIONS = {
    categoria: { title: 'O que você procura?', labelMap: { janela: 'Janela', porta: 'Porta' }, iconMap: { janela: 'fa-table-columns', porta: 'fa-door-open' } },
    sistema: { title: 'Qual sistema de abertura?', labelMap: { 'janela-correr': 'De Correr', 'porta-correr': 'De Correr', 'maxim-ar': 'Maxim-ar', 'giro': 'De Giro' }, iconMap: { 'janela-correr': 'fa-arrows-left-right', 'porta-correr': 'fa-arrows-left-right', 'maxim-ar': 'fa-up-right-and-down-left-from-center', 'giro': 'fa-rotate' } },
    persiana: { title: 'Precisa de persiana integrada?', labelMap: { sim: 'Com Persiana', nao: 'Sem Persiana' }, iconMap: { sim: 'fa-layer-group', nao: 'fa-ban' } },
    motorizada: { title: 'Persiana motorizada ou manual?', labelMap: { motorizada: 'Motorizada', manual: 'Manual' }, iconMap: { motorizada: 'fa-bolt', manual: 'fa-hand' } },
    material: { title: 'Qual material de preenchimento?', labelMap: { 'vidro': 'Vidro', 'vidro + veneziana': 'Vidro + Veneziana', 'lambri': 'Lambri', 'veneziana': 'Veneziana', 'vidro + lambri': 'Vidro + Lambri' }, iconMap: { 'vidro': 'fa-border-all', 'vidro + veneziana': 'fa-grip-vertical', 'lambri': 'fa-bars', 'veneziana': 'fa-align-justify', 'vidro + lambri': 'fa-table-cells-large' } },
    folhas: { title: 'Quantas folhas?', labelMap: { 1: '1 Folha', 2: '2 Folhas', 3: '3 Folhas', 4: '4 Folhas', 6: '6 Folhas' }, iconMap: { 1: 'fa-1', 2: 'fa-2', 3: 'fa-3', 4: 'fa-4', 6: 'fa-6' } }
};

export const FIELD_MAP = {
    categoria: 'categoria',
    sistema: 'sistema',
    persiana: 'persiana',
    motorizada: 'persianaMotorizada',
    material: 'material',
    folhas: 'folhas'
};
