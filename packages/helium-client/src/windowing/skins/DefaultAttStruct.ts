export class DefaultAttStruct
{
    public color: number;
    public background: boolean;
    public blend: number;
    public threshold: number;
    public widthMin: number;
    public widthMax: number;
    public heightMin: number;
    public heightMax: number;

    public constructor(init?: Partial<DefaultAttStruct>)
    {
        this.color = init?.color ?? 0xffffff;
        this.background = init?.background ?? false;
        this.blend = init?.blend ?? 1;
        this.threshold = init?.threshold ?? 10;
        this.widthMin = init?.widthMin ?? -2147483648;
        this.widthMax = init?.widthMax ?? 2147483647;
        this.heightMin = init?.heightMin ?? -2147483648;
        this.heightMax = init?.heightMax ?? 2147483647;
    }
}
