<script>
  import { onMount } from "svelte";
  import Icon from "$comp/Icon.svelte";
  import Image from "$comp/Image.svelte";
  import { t } from "$lib/translations";

  let team = [
    {
      name: "adam",
      socials: [
        {
          type: "twitter",
          url: "https://twitter.com/adamsoltys",
          color: "bg-[#1D9BF0]",
        },
        {
          type: "github",
          url: "https://github.com/asoltys",
          color: "bg-gray-800",
        },
      ],
    },
    { name: "cole", socials: [] },
  ];

  let locations = $state();
  onMount(async () => {
    try {
      ({ locations } = await fetch("/locations").then((r) => r.json()));
    } catch (e) {
      console.log(e);
    }
  });
</script>

<div class="flex justify-center">
  <div class="container space-y-10">
    <h3 class="text-5xl font-medium text-center">
      {$t("about.team.header")}
    </h3>
    <div class="space-y-10 2xl:space-y-0 2xl:grid gap-y-10 grid-cols-2">
      {#each team as member}
        <div class="flex w-full">
          <div class="md:flex 2xl:items-start md:max-w-2xl mx-auto">
            <div class="w-[220px] mx-auto">
              <Image
                image={member.name}
                style="rounded-full mx-auto w-40 h-40 mb-5 object-cover"
              />

              <div class="space-y-2">
                <span class="text-2xl text-center font-semibold block"
                  >{$t(`about.team.${member.name}.name`)}</span
                >
                <span class="text-xl text-center text-secondary block"
                  >{$t(`about.team.${member.name}.position`)}</span
                >
              </div>

              <div class="mt-2 flex justify-center items-center space-x-5">
                {#each member.socials as social}
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    class={`rounded-full p-2 ${social.color} hover:opacity-80`}
                    ><Icon icon={social.type} style="w-6" /></a
                  >
                {/each}
              </div>
            </div>
            <div class="text-secondary text-xl w-full max-w-[450px] mt-5">
              {$t(`about.team.${member.name}.bio`)}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

{#if locations?.length}
  <div>
    <h3 class="text-5xl font-medium mb-5 text-center">
      {$t("about.locations.header")}
    </h3>
    <p
      class="text-secondary text-xl w-full md:w-10/12 lg:w-2/3 2xl:w-[800px] mx-auto mb-10"
    >
      {@html $t("about.locations.description")}
    </p>

    <div class="relative">
      <a href="/map" class="contents">
        <img src="/map.png" class="mx-auto" alt="Map" />
      </a>

      <a href="/map" class="contents">
        <button
          class="bg-black text-white border border-4 rounded-full px-6 py-2 font-bold hover:bg-secondary absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl"
        >
          {$t("about.locations.viewMap")}
        </button>
      </a>
    </div>
  </div>
{/if}
