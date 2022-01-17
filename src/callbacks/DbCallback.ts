import { BaseEntity, Entity, Column, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export class DbCallback extends BaseEntity {
    @ObjectIdColumn() public id!: string;

    @Column() public type!: string;
    @Column() public guild!: string;
    @Column() public channel!: string;
    @Column() public vtuber!: string;
    @Column() public trigger!: string;


    toString(useVtubers?: {name: string, id: string}[]): string {
        return `**ID**: \`${this.id}\` | **Trigger***: ${this.trigger}
**VTuber:** ${useVtubers ? useVtubers.find(vtuber => vtuber.id === this.vtuber) ?? this.vtuber : this.vtuber} | Channel: <#${this.channel}>
`
    }

    toEmbedField(): {title: string, description: string} {
        const field = {} as {title: string, description: string};
        

        return field;
    }
}