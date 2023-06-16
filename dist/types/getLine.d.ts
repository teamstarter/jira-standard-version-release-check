import { ILine, ILineEmpty, ILineNoUS } from "./globals/interfaces";
export declare function getLine(line: string, outputFormat: any): Promise<ILine | ILineNoUS | ILineEmpty | undefined>;
