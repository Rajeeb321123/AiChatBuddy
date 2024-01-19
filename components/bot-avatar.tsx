import { Avatar, AvatarImage } from "./ui/avatar";

interface BotAvatar {
    src: string;
};

const BotAvatar = ({ src }: BotAvatar) => {

    return (
        <Avatar
            className="h-12 w-12"
        >
            <AvatarImage
                src={src}
            />
        </Avatar>
    )
}

export default BotAvatar