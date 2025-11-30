export interface Viajes {
    numAsientos: number;
    precio: number;
    ubicacion: [number, number];
    createdAt: Date;
    viajeId: string;
    viajeConCupo: boolean;
}
