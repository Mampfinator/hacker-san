import { BaseEntity, Entity, Column, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export class DbCallback extends BaseEntity {
    @ObjectIdColumn() public id!: ObjectID;

    @Column() public type!: string;
    @Column() public guild!: string;
    @Column() public channel!: string;
    @Column() public vtuber!: string;
}