import { Card, CardContent } from '@/components/ui/card';
import type { Post } from '@/constants/types';
import { Badge } from '@/components/ui/badge';

function PostCard({ postData }: { postData: Post }) {
  return (
    <Card className="border-none shadow-none bg-transparent ">
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="object-cover w-full h-auto"
        />
        <img
          src="/public/user2.jpg"
          alt=""
          className="absolute w-8 h-auto bottom-2 left-2 rounded-full"
        />
      </div>
      <CardContent className="p-0">
        <div className="py-4 space-x-2">
          {postData?.categories.map((category) => (
            <Badge key={category.name}>{category.name}</Badge>
          ))}
        </div>
        <h3 className="font-bold text-xl py-2 line-clamp-3 cursor-pointer">
          {postData?.title}
        </h3>
        <p className="line-clamp-3">{postData?.content}</p>
      </CardContent>
    </Card>
  );
}
export default PostCard;
