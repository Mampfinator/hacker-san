export interface CalenddarBaseNotification<EventType, NotificationPayload> {
    vtubers: string[];
    data: NotificationPayload;
    platform: "twitch" | "youtube";
    event: EventType;
}


export interface PostNotification extends CalenddarBaseNotification<"post", {
    id: string;
    channelId: string;
    type: "poll" | "image" | "video" | null;
    images?: string[];
    choices?: string[];
    video?: {
        id: string;
        thumbnail: string;
        title: string;
        descriptionSnippet: string;
    }
}> {}

interface VideoPayload {
    id: string;
    channelId: string;
    platform: "twitch" | "youtube";
    title: string;
    status: string;

    description?: string;
    scheduledFor?: string;
    startedAt?: string;
    endedAt?: string;
}

export interface CalenddarNotification extends CalenddarBaseNotification<any, any> {};
export interface LiveNotification extends CalenddarBaseNotification<"live", VideoPayload & {wasScheduled: string}> {};
export interface UpcomingNotification extends CalenddarBaseNotification<"upcoming", VideoPayload> {};
export interface OfflineNotification extends CalenddarBaseNotification<"offline", VideoPayload> {};
export interface MovedNotification extends CalenddarBaseNotification<"moved", VideoPayload & {previousScheduledFor: string}> {};