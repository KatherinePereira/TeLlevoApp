export interface Usuario {
    rut: string;
    fechaNacimiento: string;
    pnombre: string;
    snombre:string;
    papellido: string;
    sapellido: string;
    celular: string;
    email: string;
    pass: string;
    pass2: string;
    tipo: string;
    vehiculoRegistrado?: boolean;
    usuarioDeshabilitado?: boolean;
}
