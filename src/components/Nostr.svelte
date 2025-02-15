<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import PasswordInput from "$comp/PasswordInput.svelte";
  import { Relay } from "nostr-tools/relay";
  import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
  import {
    nip04,
    nip19,
    getEventHash,
    generateSecretKey,
    getPublicKey,
  } from "nostr-tools";
  import { AmberClipboardSigner } from "applesauce-signer";

  import { copy, focus, fail, post } from "$lib/utils";
  import { eventToSign, signer } from "$lib/store";
  import { nostrConnectRelay } from "$lib/nostr";
  import Success from "$comp/Success.svelte";

  let { id } = $props();
  let extensionAvailable = $derived(browser && window.nostr);

  let cancel = () => {
    eventToSign.set();
    showNsec = false;
    pubkey = undefined;
    connectUrl = undefined;
  };

  let signerAvailable = $derived(
    browser &&
      navigator.userAgent.includes("Android") &&
      navigator.clipboard &&
      navigator.clipboard.readText,
  );

  let hadSigner = $state(!!$signer);

  let connectUrl = $state();
  let nostrConnect = async () => {
    let connectionSecret = crypto.randomUUID();

    let sk = generateSecretKey();
    let pubkey = getPublicKey(sk);

    connectUrl = `nostrconnect://${pubkey}?relay=${encodeURIComponent(nostrConnectRelay)}&perms=sign_event%3A1&name=Coinos&secret=${connectionSecret}`;

    let relay = await Relay.connect(nostrConnectRelay);
    relay.subscribe([{ kinds: [24133], "#p": [pubkey] }], {
      async onevent(event) {
        let pk = event.pubkey;
        try {
          let { result } = JSON.parse(
            await nip04.decrypt(sk, pk, event.content),
          );
          if (result === connectionSecret) {
            $signer = {
              method: "connect",
              params: {
                sk: bytesToHex(sk),
                pk,
                pubkey,
              },
              ready: true,
            };
          }
        } catch (e) {
          console.log("failed to parse nostr connect event", e);
        }
      },
    });
  };

  let nsec = $state();
  let showNsec = $state();
  let toggleNsec = () => {
    $signer = {
      method: "nsec",
    };
  };

  let nsecSign = async () => {
    let sk;
    if (nsec.startsWith("nsec")) sk = nip19.decode(nsec).data as Uint8Array;
    else sk = hexToBytes(nsec);

    $signer = {
      method: "nsec",
      params: { sk: bytesToHex(sk), pk: getPublicKey(sk) },
      ready: true,
    };
  };

  let extensionSign = async () => {
    $signer = { method: "extension", ready: true };
  };

  let signerGetPubkey = async () => {
    const pubkey = await new AmberClipboardSigner().getPublicKey();
    $signer = {
      method: "signer",
      params: { pubkey },
    };
  };

  let signerSign = async () => {
    document.addEventListener("focus", signerSigned, true);
  };

  const signerSigned = async () => {
    await new Promise((r) => setTimeout(r, 100));
    let sig = await navigator.clipboard.readText();
    $signer.params.sig = sig;
    $signer.ready = true;
    $signer = $signer;
  };

  let signUrl = $derived(
    `nostrsigner:${encodeURIComponent(JSON.stringify($eventToSign))}?compressionType=none&returnType=signature&type=sign_event&appName=Coinos`,
  );
</script>

{#if $eventToSign && !$signer?.ready}
  <div
    class="fixed inset-0 bg-base-100 bg-opacity-90 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative mx-auto mt-10 p-5 border w-96 shadow-lg rounded-md bg-base-100 space-y-5"
    >
      <h1 class="text-center text-2xl font-semibold">Nostr sign</h1>

      {#if $eventToSign.sig && !hadSigner}
        <Success />
      {:else}
        {#if connectUrl}
          <a href={connectUrl}>
            <img
              src={`/qr/${encodeURIComponent(connectUrl)}/raw`}
              class="z-10 border-4 border-white"
              alt="QR"
            />
            <div class="break-all">
              {connectUrl}
            </div>
          </a>
          <button class="btn" onclick={() => copy(connectUrl)}>Copy</button>
        {:else}
          {#if $signer?.method === "nsec"}
            <input bind:value={nsec} placeholder="nsec..." />
            <button type="button" class="btn btn-accent" onclick={nsecSign}>
              <iconify-icon icon="ph:paper-plane-right-bold" width="32"
              ></iconify-icon>
              <div class="my-auto">Submit</div>
            </button>
          {/if}

          {#if $signer?.method === "signer"}
            <a href={signUrl} type="button" class="btn" onclick={signerSign}>
              <iconify-icon
                icon="material-symbols:diamond-rounded"
                width="32"
                class="text-orange-400"
              ></iconify-icon>
              <div class="my-auto">NIP-55 Signer</div>
            </a>
          {/if}

          {#if !$signer}
            {#if extensionAvailable}
              <button type="button" class="btn" onclick={extensionSign}>
                <iconify-icon
                  icon="lucide-lab:bee"
                  width="32"
                  class="text-yellow-400"
                ></iconify-icon>
                <div class="my-auto">Browser extension</div>
              </button>
            {/if}

            <button type="button" class="btn" onclick={nostrConnect}>
              <img src="/images/nostr.png" class="w-8" alt="Nostr" />
              <div class="my-auto">Nostr connect</div>
            </button>

            {#if signerAvailable}
              <button type="button" class="btn" onclick={signerGetPubkey}>
                <iconify-icon
                  icon="material-symbols:diamond-rounded"
                  width="32"
                  class="text-orange-400"
                ></iconify-icon>
                <div class="my-auto">NIP-55 Signer</div>
              </button>
            {/if}

            <button type="button" class="btn" onclick={toggleNsec}>
              <iconify-icon icon="ph:key-bold" width="32"></iconify-icon>
              <div class="my-auto">Secret key</div>
            </button>
          {/if}
        {/if}

        <button type="button" class="btn" onclick={cancel}>
          <iconify-icon icon="ph:x-bold" width="32"></iconify-icon>
          <div class="my-auto">Cancel</div>
        </button>
      {/if}
    </div>
  </div>
{/if}
