<script lang="ts">
  import { Modal, PrimaryButton } from 'components';
  import { onMount } from 'svelte';
  const CURRENT_VERSION = '0.1.0';

  let toggle;
  let checked: boolean = false;
  const unprotected = ['/faq', '/terms-of-service'];

  let accept = () => {
    localStorage.setItem(
      'privacy_policy',
      JSON.stringify([{ version: CURRENT_VERSION, accepted: true }])
    );
    toggle();
  };

  onMount(() => {
    const isAccepted = JSON.parse(
      localStorage.getItem('privacy_policy')
    )?.filter((p) => p.version === CURRENT_VERSION);
    if (!isAccepted && !unprotected.includes(window.location.pathname)) {
      toggle();
    }
  });
</script>

<Modal bind:toggle>
  <div slot="title" class="text-gray-650 text-center w-full">
    <h3>Privacy Policies</h3>
  </div>
  <div slot="body" class="text-gray-650 overflow-y-auto px-6 my-6">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultricies
    justo pulvinar velit convallis congue. Duis quis metus vulputate,
    ullamcorper quam in, ornare lacus. Donec et dignissim massa, sit amet
    egestas orci. Aliquam maximus justo non lectus dictum feugiat. In justo
    neque, porttitor vitae massa aliquet, faucibus volutpat nulla. Fusce ipsum
    enim, efficitur non euismod a, mollis non tellus. Donec ut lacinia purus,
    vitae molestie nulla. Fusce ac consectetur nisi. Nullam nulla tortor,
    ultricies tincidunt nulla sed, consequat facilisis diam. Class aptent taciti
    sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
    Aliquam erat volutpat. Curabitur maximus, enim quis congue iaculis, ex justo
    elementum ante, vel vulputate dolor sapien rhoncus ipsum. Aliquam erat
    volutpat. Nam nec est sodales, tempus felis a, facilisis turpis. Donec lacus
    arcu, ornare a tincidunt nec, tempus ac risus. Pellentesque tempor arcu dui,
    euismod suscipit ex tincidunt non. Suspendisse at velit quis augue
    vestibulum dictum. Nam maximus tortor ac tempus condimentum. Sed eu tortor
    euismod, hendrerit ipsum eu, faucibus neque. Phasellus mattis id ex id
    pellentesque. Integer in auctor mauris. Sed magna orci, accumsan vitae porta
    interdum, lacinia eget dolor. Praesent eleifend felis ligula, nec
    pellentesque metus mattis ut. Sed dignissim, mi eu porttitor interdum, eros
    dui faucibus purus, eget tincidunt dolor mi laoreet nibh. Cras id arcu id
    sapien maximus sollicitudin et finibus turpis. Praesent est turpis, commodo
    vel neque vitae, mollis elementum sapien. Integer congue massa erat, at
    lobortis nunc commodo sed. Suspendisse nulla libero, maximus in auctor
    elementum, placerat vel diam. Donec rutrum dui molestie nulla ultrices
    porttitor. Integer at eleifend orci. In mollis suscipit ex, id pulvinar
    dolor facilisis quis. Fusce consectetur velit erat, a aliquet quam gravida
    vitae. Nulla id tempus dui. In hac habitasse platea dictumst. Integer vel
    nisl tellus. Quisque consectetur convallis nunc, a finibus elit volutpat eu.
    Pellentesque commodo feugiat mauris eget finibus. Fusce lacus quam, sodales
    sed nibh vitae, feugiat volutpat ipsum. Curabitur at eros quis enim pulvinar
    ultrices at quis lectus. Sed et arcu ac sapien efficitur auctor. Fusce nisi
    dui, pharetra ac facilisis sit amet, porta porttitor arcu. Vivamus mollis
    ultricies ligula, quis aliquet urna dapibus et. Pellentesque vitae faucibus
    mi, a sagittis mauris. Nam interdum interdum pharetra. Sed sit amet diam
    vitae turpis facilisis aliquet. Suspendisse euismod tellus erat, laoreet
    iaculis felis maximus sit amet. Quisque ut faucibus est. Integer facilisis
    dui eget augue pellentesque, egestas tristique nunc mattis. Sed aliquet
    turpis at diam auctor, accumsan commodo nibh viverra. Vestibulum faucibus
    placerat venenatis. Phasellus libero nisi, lobortis id semper ut,
    scelerisque et nunc. Maecenas lacinia et nulla quis commodo. Ut bibendum
    gravida sapien, feugiat vestibulum velit scelerisque quis. Phasellus mattis
    ex lorem, ut finibus metus molestie in. Curabitur mollis malesuada leo et
    varius. Quisque elit leo, condimentum vel leo eu, iaculis ultricies ex.
    Aenean porttitor diam sit amet condimentum accumsan. Duis ullamcorper, neque
    eget bibendum efficitur, justo lectus gravida quam, eget bibendum ante neque
    eget elit. Praesent felis lorem, ornare eu sem id, finibus varius lectus.
    Donec leo elit, lacinia ut semper nec, mattis at purus. Nullam vestibulum
    turpis nec arcu pharetra, et molestie ex convallis. Suspendisse mattis
    finibus eros, ac malesuada lectus ultricies vitae. Integer felis dui,
    commodo sed libero et, faucibus rutrum tortor. Praesent eu sapien nec lacus
    facilisis vulputate. Vestibulum posuere ut dolor quis suscipit. Aliquam ac
    consequat lacus. Phasellus eu nulla non neque vulputate varius. Donec sit
    amet neque magna. Proin feugiat sit amet nulla eget facilisis. Aliquam
    accumsan tellus mauris, ut lobortis lorem pellentesque sed. Morbi sit amet
    rutrum tortor. Aliquam euismod scelerisque massa sit amet bibendum. Cras
    tortor purus, finibus non diam nec, rutrum tempus sem. Ut volutpat, quam ac
    auctor suscipit, sem neque malesuada dolor, ut eleifend tellus nisl in
    lorem. Ut luctus, ligula ut blandit vulputate, lacus ligula facilisis
    sapien, eget fringilla enim ligula pretium felis. Nam nisi turpis, pharetra
    vel neque quis, tristique tempor urna. Phasellus eget elit mauris. Aliquam
    lobortis scelerisque lacus vel egestas. Pellentesque vitae posuere nulla.
    Vestibulum sodales ac quam vitae aliquam. Suspendisse sit amet sapien
    pellentesque urna molestie aliquet vel non tortor. Suspendisse ut posuere
    leo. Aenean venenatis congue mi vitae tristique. Maecenas sit amet lobortis
    magna. Cras consequat est dictum, cursus lacus mattis, malesuada urna.
    Quisque non feugiat massa, sit amet lacinia tortor. Donec vel nulla vitae
    nisl congue iaculis id ac purus. Nulla volutpat, diam id molestie aliquam,
    libero nisl ultrices libero, interdum sollicitudin est arcu ac mi. In hac
    habitasse platea dictumst. Donec nec fringilla urna. Nulla convallis, velit
    ac molestie ultricies, purus ex finibus erat, elementum convallis ligula
    lectus nec dui. Nullam in nulla orci. Vestibulum ante ipsum primis in
    faucibus orci luctus et ultrices posuere cubilia curae; Vivamus vulputate
    fermentum eros hendrerit accumsan. Vivamus eget luctus tellus. Etiam
    condimentum tortor pretium leo mattis, ac placerat neque malesuada.
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames
    ac turpis egestas. Orci varius natoque penatibus et magnis dis parturient
    montes, nascetur ridiculus mus. Pellentesque varius volutpat urna eu
    ullamcorper. Sed neque metus, hendrerit tempor justo hendrerit, dictum
    eleifend eros. Maecenas mollis, tellus vel semper elementum, nulla magna
    tincidunt purus, ut elementum ipsum ipsum at enim. Mauris et libero nibh.
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames
    ac turpis egestas. Phasellus eu tempus mi. Morbi elementum turpis erat, vel
    lobortis orci rhoncus ac. Cras vulputate sit amet justo in gravida. Maecenas
    id porta quam. Etiam ullamcorper ex mauris, sed ornare arcu feugiat in.
    Phasellus eu lectus et turpis sagittis scelerisque ac ut ex. Etiam faucibus,
    lectus id commodo eleifend, libero mi efficitur lorem, vel rutrum lorem arcu
    sed lectus. Donec id ligula vel quam porttitor hendrerit et ut tellus.
    Mauris malesuada tortor quis libero vulputate blandit. Nullam turpis mauris,
    auctor sed placerat eu, faucibus non ante. Vivamus elementum euismod quam,
    eu finibus mi tincidunt non. Etiam pretium viverra sem, in dictum elit
    rhoncus et. Nam ornare blandit sem at fermentum. Maecenas tincidunt
    fermentum turpis. Mauris vel sagittis leo, eu vestibulum turpis. Suspendisse
    eleifend diam eget erat malesuada, quis facilisis risus tincidunt. Ut sed
    luctus elit, nec maximus ex. Suspendisse scelerisque faucibus mi vel
    convallis. Aliquam eu orci nec lectus iaculis cursus scelerisque id libero.
    Mauris ut pellentesque diam, eu interdum lectus. Pellentesque ut massa odio.
    Duis sit amet magna et dolor fringilla convallis. Nullam ultricies dignissim
    orci non elementum. Nulla quis elementum ligula. Donec varius vestibulum
    congue. Donec commodo, diam eu commodo porta, enim turpis auctor velit,
    auctor sagittis nisl velit ac libero. In et nibh ut turpis feugiat ornare.
    Sed blandit massa massa, sit amet viverra enim mattis sed. Integer porta
    lorem nec viverra mattis. Nunc ultricies elit purus, placerat egestas nunc
    laoreet placerat. Class aptent taciti sociosqu ad litora torquent per
    conubia nostra, per inceptos himenaeos. Aliquam sit amet turpis odio. Aenean
    aliquam sapien sit amet massa gravida, eleifend faucibus tellus pharetra.
    Mauris iaculis magna sem, vitae gravida ligula dignissim at. Nullam lacinia
    odio sit amet libero dapibus fringilla. Phasellus at leo condimentum,
    molestie sem id, tempus nulla. Nullam rhoncus eget leo at facilisis. Lorem
    ipsum dolor sit amet, consectetur adipiscing elit. Cras pretium at tellus
    nec maximus. Maecenas in convallis dolor. Ut mattis varius commodo.
    Suspendisse commodo, velit ut elementum vestibulum, metus dolor rhoncus ex,
    rutrum dictum ante massa rutrum metus. Phasellus dapibus felis non lectus
    tempus, sollicitudin condimentum velit ultricies. Pellentesque imperdiet
    orci lacus, vel accumsan velit posuere vel. In hac habitasse platea
    dictumst. Duis facilisis ultricies mauris, quis rutrum dolor. Aliquam
    pretium dignissim felis et ultricies. Nunc consectetur felis at odio gravida
    vestibulum. Nulla tincidunt et diam id dictum. Vestibulum cursus neque
    pulvinar tortor eleifend, eu cursus sem porttitor. Integer interdum ex in
    ultricies cursus. Fusce ac sagittis sem. Curabitur convallis mi nec sem
    cursus eleifend. In nec ex ligula. Vestibulum mi ante, dictum in eros at,
    lobortis efficitur urna. Vestibulum ante ipsum primis in faucibus orci
    luctus et ultrices posuere cubilia curae; Donec eget aliquet leo. Quisque ut
    porta velit. Maecenas scelerisque tincidunt tortor eu efficitur.
    Pellentesque porta pulvinar odio. Quisque in tristique neque, in ultricies
    velit. Vivamus interdum eros consequat orci viverra, vel bibendum ipsum
    tincidunt. Pellentesque sed nulla nec mi pretium varius. Vivamus et iaculis
    purus, sed cursus orci. Mauris nulla nisi, porta eget convallis a, aliquet
    sit amet massa. Morbi congue ex vel velit pretium feugiat. Aliquam et massa
    venenatis purus pretium placerat vitae non elit. Aenean volutpat augue
    aliquet auctor sollicitudin. Morbi mattis finibus urna ut tristique. Sed sem
    orci, volutpat id enim id, tincidunt tempus odio. Nulla at congue urna.
    Donec elementum id mauris eu dapibus. Nam metus enim, aliquam rutrum posuere
    sit amet, euismod id velit. Sed in egestas erat, sed ultrices nibh. Quisque
    accumsan laoreet mauris, et faucibus lorem maximus sit amet. Pellentesque
    sem nibh, gravida at faucibus non, consectetur a ex. Aliquam eget dignissim
    nunc. Suspendisse maximus lacus nisi, at eleifend nisl vestibulum sit amet.
    Donec venenatis placerat turpis, in lobortis mi tristique quis.
  </div>
  <div slot="footer" class="text-gray-650 flex w-full px-6 items-center">
    <input on:change={() => (checked = !checked)} type="checkbox" />
    <p class="flex-grow text-xs md:text-sm text-left px-4">
      I have <span class="font-bold">read</span> and
      <span class="font-bold">agree</span>
      with the Privacy Policies and
      <span class="text-blue-550 underline">
        <a href="/terms-of-service"> Terms of Service </a>
      </span>
    </p>
    <PrimaryButton text="Accept" onClick={accept} disabled={!checked} />
  </div>
</Modal>
