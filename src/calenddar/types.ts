export interface CalenddarNotification<EventType, NotificationPayload> {
    vtubers: string[];
    data: NotificationPayload;
    platform: "twitch" | "youtube";
    event: EventType;
}


export interface PostNotification extends CalenddarNotification<"post", {
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

export interface LiveNotification extends CalenddarNotification<"live", VideoPayload & {wasScheduled: string}> {};
export interface UpcomingNotification extends CalenddarNotification<"upcoming", VideoPayload> {};
export interface OfflineNotification extends CalenddarNotification<"offline", VideoPayload> {};
export interface MovedNotification extends CalenddarNotification<"moved", VideoPayload & {previousScheduledFor: string}> {};