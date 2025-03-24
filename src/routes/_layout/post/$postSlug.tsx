import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { fetchPostQueryOptions } from '@/api/postsApi';

export const Route = createFileRoute('/_layout/post/$postSlug')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      fetchPostQueryOptions(params.postSlug)
    );
  },
});

function RouteComponent() {
  const { postSlug } = Route.useParams();
  const { data } = useSuspenseQuery(fetchPostQueryOptions(postSlug));

  return (
    <article className="pd-x pd-y">
      <div className="md:px-20 lg:px-28">
        <h1 className="text-5xl md:text-6xl lg:text-7xl  tracking-wider py-6  font-semibold mb-6">
          {data?.data.title}
        </h1>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <img className="rounded-full" src="/user2.jpg" alt="author pic" />
          </div>
          <div>
            <p>
              By{' '}
              <span className="font-semibold">
                {data?.data.author.username}
              </span>
            </p>
            <p>
              {new Date(data?.data.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="w-full py-10">
          <img
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="cover"
          />
        </div>
        <p className="px-4  text-lg">
          {' '}
          {data?.data.content} Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Sed id sint neque minus praesentium quam porro
          similique, consequuntur numquam voluptatum cumque facere non
          reprehenderit minima, recusandae unde! Mollitia, architecto
          voluptatem? Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Iste animi provident ipsam alias, explicabo ipsa, voluptas
          voluptatibus sapiente obcaecati ipsum in commodi at ullam illo atque
          asperiores quidem. Totam, libero. Corrupti maiores reprehenderit
          placeat eligendi aliquid dolor, cupiditate explicabo libero odio
          similique totam! Quod eum voluptatibus quo, id amet deserunt, expedita
          ab similique ex dignissimos, vel cum accusantium veritatis iusto.
          Consequuntur suscipit perspiciatis maiores officia omnis id! Deserunt
          facilis, facere earum laborum sit culpa tenetur quisquam officiis,
          deleniti nobis praesentium hic cupiditate adipisci quibusdam qui
          totam, magni ducimus recusandae exercitationem? Quod provident, quia
          illo ipsum culpa pariatur animi dolorem similique odio repellendus non
          asperiores modi excepturi nesciunt nostrum, illum et adipisci odit
          deserunt nihil? Minus alias delectus ipsum minima iste? Consectetur
          harum obcaecati tenetur cumque accusantium sit maiores, optio
          perferendis deserunt numquam quae id. Facere quos officiis iure
          consequuntur ipsum dolore itaque impedit amet ad, atque veniam.
          Dolores, ratione molestiae. Accusamus saepe vero quas exercitationem
          cum, error commodi nobis eveniet, harum reiciendis deleniti et odit?
          Libero possimus blanditiis cupiditate molestiae eaque fugit magni,
          rerum accusamus commodi sapiente? Veniam, qui repellat! Assumenda
          exercitationem architecto ab perferendis adipisci, asperiores, cumque
          labore temporibus consequatur iure ipsum suscipit, corporis itaque?
          Beatae quia animi deserunt labore deleniti quaerat, harum impedit
          numquam tempora, laudantium, aut ut. Officia molestias, ipsam qui
          blanditiis sunt commodi nobis nam aperiam reprehenderit non! Aliquid
          repellat corrupti totam, ipsa non, facere aut vitae est eos ex
          repellendus accusantium possimus. Pariatur, itaque ullam. Dolorum vero
          praesentium libero soluta necessitatibus iusto quas cum explicabo
          reiciendis enim, labore laudantium ad iure nobis numquam dolor
          distinctio consequuntur architecto consectetur autem recusandae, est
          nemo? Quis, eos unde? Ad libero possimus ex porro exercitationem
          repudiandae consectetur esse est temporibus. Ducimus beatae dolor,
          labore placeat nesciunt odio at magni, iure distinctio eveniet animi,
          repellat sunt amet nisi nihil earum!{' '}
        </p>
        <div className="h-[400px] bg-secondary my-10">comments section</div>
      </div>
    </article>
  );
}
