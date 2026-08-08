"""Neutralize editorName/editorTake across all destination YAML files.
Replaces first-person fictional editor takes with neutral, verifiable commentary.
Usage: python scripts/neutralize_editor_takes.py
"""
import glob
import re

# Neutral rewrites: filename -> body text (keeps factual info, drops first-person fiction)
REPLACEMENTS = {
    'anilao.yaml': (
        "Anilao is the Philippines' best muck diving hub, within three hours of Manila. The black sand "
        "slopes deliver some of the most photographed macro life on the planet: rhinopias, blue-ringed "
        "octopus, flamboyant cuttlefish, and more nudibranch species than most divers can name. The "
        "blackwater dives after dark are the standout — larval fish and planktonic creatures rarely seen "
        "by day. It is not about coral reefs here; it is about the tiny, bizarre, and beautiful. "
        "Budget-friendly, too — three dives a day can still come in under $100."
    ),
    'azores.yaml': (
        "The Azores draw divers who prefer cold-water pelagic encounters to tropical reefs. Princess "
        "Alice Bank is the flagship site — mobula rays circling divers for twenty minutes, completely "
        "unbothered, with blue sharks appearing on safety stops. August water hovers around 22°C — "
        "chilly but manageable in a 7mm suit — and the volcanic seascapes are unlike anything in the "
        "Indo-Pacific. The Atlantic swell can cancel dive days without warning, so itineraries need "
        "buffer days. For big pelagics in Europe, the Azores are unmatched."
    ),
    'bali.yaml': (
        "Bali is the diver's compromise destination — non-divers get yoga and smoothie bowls while "
        "divers get manta rays at Manta Point and pygmy seahorses in Tulamben. The USAT Liberty wreck "
        "is one of the few world-class wrecks accessible from shore, and sunrise dives there beat the "
        "crowds. The bumphead parrotfish at Crystal Bay at dawn are a highlight. For a destination this "
        "easy to reach, the diving punches well above its weight — beginner-friendly yet deeply "
        "rewarding for veterans."
    ),
    'belize.yaml': (
        "An honest assessment: the Blue Hole itself underwhelms as a dive — 45 meters into a dark "
        "sinkhole with stalactites and little marine life. But the two reef dives that follow at "
        "Lighthouse Reef are exceptional: spotted eagle rays in formation, nurse sharks under every "
        "ledge, and healthy corals. Turneffe Atoll is the real star, with Caribbean reef octopus "
        "changing colors in the shallows. Belize is warm, clear, shallow, and an ideal first tropical "
        "trip for newly certified divers."
    ),
    'bonaire.yaml': (
        "Shore diving does not get better than Bonaire. Divers rent a pickup truck, load tanks in the "
        "back, and drive from site to site with no boat schedule to chase. The Hilma Hooker wreck at "
        "30 meters is the marquee attraction, but the double reef system at Angel City — shallow reef, "
        "sand channel, deeper wall, all reachable with a giant stride from a parking lot — steals the "
        "show. Bonaire is not about megafauna; it is about freedom, consistency, and some of the "
        "healthiest Caribbean hard corals, in 80°F water with 30-meter visibility."
    ),
    'chuuk-lagoon.yaml': (
        "Truk Lagoon is the undisputed holy grail of wreck diving. The San Francisco Maru at 55 meters "
        "is still loaded with tanks and munitions from 1944, like a museum sealed for eighty years. The "
        "Fujikawa Maru's engine room, with intact telegraphs and portholes filtering blue light, is one "
        "of the most atmospheric dives on Earth. Truk demands experience — deep wrecks, overhead "
        "environments, long deco stops — making it strictly a technical divers' destination."
    ),
    'cocos-island.yaml': (
        "Cocos Island is reached by a 36-hour liveaboard crossing each way — and divers still call it "
        "worth it. At Bajo Alcyone, schools of two hundred hammerheads materialize from the blue. Cocos "
        "is hammerhead central, with marble rays at night, tiger sharks at Manuelita, and Galapagos "
        "sharks on nearly every dive. Expect negative entries, blue-water ascents, and ripping "
        "currents. For big-animal obsessives, Cocos delivers like nowhere else in the Eastern Pacific."
    ),
    'cozumel.yaml': (
        "Drift diving at its finest. The current carries divers past 40-meter walls draped in orange "
        "sponges, through swim-throughs bursting with glassy sweepers, and over sand flats where eagle "
        "rays bury themselves for camouflage. Palancar Reef is the standout — towering coral pinnacles, "
        "tunnels, and caves. Santa Rosa Wall delivers spotted eagle rays soaring past at close range. "
        "Warm, clear, easy, and 45 minutes from Houston — among the most accessible world-class diving "
        "in the Western Hemisphere."
    ),
    'fernando-de-noronha.yaml': (
        "Brazil's Fernando de Noronha does not get enough credit in the dive world. Spinner dolphins at "
        "morning briefings, sea turtles on nearly every dive, and Pedras Secas — where fifteen reef "
        "sharks circle below in a single panorama. The volcanic rock formations create dramatic "
        "underwater arches and caverns that feel more Pacific than Atlantic. Visibility is 15-25 meters "
        "rather than Caribbean-perfect, but the sheer biomass more than compensates. Expensive to "
        "reach, limited daily permits, no liveaboards — which is exactly why it remains pristine."
    ),
    'fiji.yaml': (
        "The soft coral capital of the world lives up to the billing. The Great White Wall in the "
        "Somosomo Strait is the most intense color experience in diving — a vertical drop-off carpeted "
        "in lavender and white soft corals so dense the rock beneath is invisible. Namena Marine "
        "Reserve delivers hammerheads on the north side, barracuda tornadoes in the channel, and a "
        "manta cleaning station that runs like clockwork at high tide. Fiji rewards long stays — ten "
        "days minimum, split between Taveuni and Bligh Water."
    ),
    'galapagos.yaml': (
        "Darwin and Wolf are the two names every diver should have on their must-dive list. July brings "
        "18°C water, green visibility, and surging current — but marine iguanas feeding underwater at "
        "Cabo Marshall and 12-meter pregnant whale sharks at Darwin make it unforgettable. The "
        "Galapagos is humbling: divers are in the ocean's food chain, not above it. Sea lions steal "
        "fins; hammerheads school by the hundreds; the topography is violent, volcanic, utterly alien. "
        "Not for beginners. For the right diver, nothing on Earth compares."
    ),
    'great-barrier-reef.yaml': (
        "The Great Barrier Reef is so vast it is almost meaningless to say you have dived it. Cairns, "
        "Port Douglas, and the Ribbon Reefs each feel like a different ocean. Cod Hole delivers "
        "massive potato cod that swim right up to divers' masks; the night dive at Osprey Reef, with "
        "oceanic whitetips circling in the boat lights, is pure adrenaline. Inner reef sites near "
        "Cairns suit beginners but are crowded and bleached in places. The documentary version of the "
        "GBR lives 60 kilometers offshore — invest in a three-day liveaboard."
    ),
    'kimbe-bay.yaml': (
        "Papua New Guinea is raw, unpredictable, and almost completely untouristed — exactly why Kimbe "
        "Bay stands out. The seamounts here rise from a thousand meters, draped in sea fans and barrel "
        "sponges, patrolled by silvertip sharks and massive dogtooth tuna. Inglis Shoal is often dived "
        "by a single boat, and the barracuda school at Christine's Reef numbers in the thousands. PNG "
        "logistics are challenging — internal flights, limited infrastructure, variable visibility — "
        "but the reward is dive sites shared with perhaps four other divers."
    ),
    'komodo.yaml': (
        "Komodo teaches more about drift diving in ten days than a hundred dives elsewhere. Batu Bolong "
        "at slack tide is an aquarium on steroids — Napoleon wrasse, turtles, white-tips, and "
        "vibrantly colored coral. Manta Alley at high current delivers mantas barrel-rolling through a "
        "cleaning station. The secret is timing: operators who read the tides, not the clock. Komodo "
        "rewards experience and punishes complacency — divers with fewer than thirty dives should "
        "wait. Ready for current and negative entries? It is Southeast Asia's best all-around diving."
    ),
    'lembeh-strait.yaml': (
        "If coral reefs are museums, Lembeh is the library of the weird. A single 70-minute muck dive "
        "at Nudi Falls can produce a hairy frogfish, a mimic octopus impersonating a flounder, mating "
        "Pegasus seamoths, and a flamboyant cuttlefish mid-hunt. Zero hard coral, five-star critter "
        "encounters. The black sand slopes look dead from the surface, but within five minutes of "
        "descent, guides find something divers have never seen before. Lembeh is slow diving — "
        "fin-tip control, 90-minute bottom times, macro lens mandatory."
    ),
    'malapascua.yaml': (
        "Divers come for the thresher sharks and stay for everything else. Monad Shoal at sunrise — "
        "descending to 25 meters in the dark, kneeling on a sandy ledge as the first thresher "
        "materializes with its tail streaming like a silk ribbon — is a ritual every diver should "
        "experience. Gato Island delivers playful cuttlefish, and a lighthouse night dive turns into a "
        "macro treasure hunt. Malapascua is affordable, easy to reach from Cebu, and belongs on every "
        "Philippines itinerary."
    ),
    'maldives.yaml': (
        "The Maldives can be done two ways — resort-based day diving or a week-long luxury liveaboard "
        "— and the liveaboard wins by a mile. The channel dives are controlled chaos: hooking into the "
        "reef at 25 meters as grey reef sharks, white-tips, eagle rays, and giant trevally stream past "
        "in the current. The night dive at Alimatha Jetty, with thirty-plus nurse sharks and giant "
        "stingrays competing for scraps, is unforgettable. The Maldives is expensive — $250 per day "
        "minimum on a liveaboard — but for reliable big-fish encounters in bath-warm water, nothing is "
        "more consistent."
    ),
    'palau.yaml': (
        "Blue Corner is famous for a reason. Hook in at 15 meters as the current rips past the plateau "
        "and the show starts: grey reef sharks patrolling below, barracuda schools swirling, Napoleon "
        "wrasse cruising past, turtles so abundant divers stop photographing them. Repeat dives are "
        "never the same — one day brings an oceanic manta parked in the current for thirty minutes. "
        "The Jellyfish Lake snorkel between dives is the surreal bonus. Expensive to reach but "
        "rewarding. Minimum 50 dives recommended for the current-heavy signature sites."
    ),
    'poor-knights.yaml': (
        "Subtropical diving off New Zealand's North Island — no coral at all, but a riot of color from "
        "sponges, bryozoans, and anemones in electric orange, pink, and purple. The archways at "
        "Northern Arch are cathedral-like, with shafts of light piercing the gloom and short-tail "
        "stingrays stacked on the sandy floor. February water is a brisk 20°C, needing a 7mm suit. The "
        "resident school of blue maomao at the namesake arch is mesmerizing — thousands of fish moving "
        "as one organism. Not a tropical postcard, but unforgettable and worth the journey."
    ),
    'raja-ampat.yaml': (
        "Raja Ampat is the standard by which all other diving is measured. Cape Kri holds the world "
        "record with 283 fish species recorded on a single dive. Melissa's Garden has hard coral "
        "coverage so dense it looks like an aerial photograph of a rainforest. The Passage — drifting "
        "through a mangrove-lined channel with archerfish spitting at insects above and soft coral "
        "walls below — is one of the most unique underwater topographies anywhere. It is remote and "
        "expensive, but for marine biodiversity, no destination comes close."
    ),
    'rangiroa.yaml': (
        "Tiputa Pass on an incoming tide is the closest diving gets to flying. The current sweeps "
        "divers through a 200-meter-wide channel at four knots as bottlenose dolphins play in their "
        "bubbles and great hammerheads patrol the deep blue below. Visibility routinely exceeds 50 "
        "meters in crystal-clear oceanic water. Rangiroa is a single-atoll destination in the Tuamotus "
        "— a serious commitment to reach — but the pass dives are unlike anything in the Caribbean or "
        "Indo-Pacific. Best suited to experienced divers comfortable with drift protocols and negative "
        "entries."
    ),
    'red-sea.yaml': (
        "The Red Sea offers three completely different itineraries — north, central, and Deep South. "
        "The Thistlegorm in the north is the world's most famous wreck: trucks, motorcycles, rifles, "
        "and Wellington boots still scattered in the holds eighty years later. The Brothers Islands "
        "deliver oceanic whitetips on nearly every dive and soft coral walls rivaling Fiji. The Deep "
        "South is hammerhead territory — remote, pristine, barely dived. The Red Sea is also "
        "incredible value: a seven-night liveaboard costs what two days in the Maldives would."
    ),
    'silfra.yaml': (
        "Drinking water while diving is not usually advisable — but at Silfra, divers swim through "
        "glacial meltwater so pure it is literally potable mid-dive. Visibility exceeds one hundred "
        "meters, with divers eighty meters ahead visible as clearly as in an aquarium. The fissure "
        "between the North American and Eurasian tectonic plates makes the descent feel like entering "
        "the center of the Earth. At 2-4°C year-round, a drysuit is non-negotiable, and thirty-five "
        "minutes is the practical limit before the cold sets in. Almost no marine life — but it is "
        "about geology, clarity, and diving between continents."
    ),
    'similan-islands.yaml': (
        "Richelieu Rock is widely considered the best dive site in Thailand. A horseshoe-shaped "
        "pinnacle in open ocean, covered in purple and pink anemones with five species of anemonefish "
        "defending their territory — and whale sharks cruising past if luck is on your side. Dive "
        "three times and each is completely different: one dive brings a manta ray, another a massive "
        "barracuda school, another a zebra shark sleeping under a coral head. The Similans close May "
        "through October for monsoon season; liveaboards from Khao Lak are the only way to experience "
        "the best sites properly."
    ),
    'sipadan.yaml': (
        "Sipadan is a limestone pinnacle rising six hundred meters from the seabed, and the diving is "
        "every bit as dramatic as the geology. Barracuda Point at dawn — descending into a tornado of "
        "thousands of chevron barracuda — is the single most iconic dive in Southeast Asia. Drop-Off "
        "can produce dozens of turtles on a single dive, and whitetip reef sharks patrol South Point "
        "in numbers. Daily permits are capped at 120 and sell out months ahead. Sipadan is fiercely "
        "protected and it shows: the fish biomass here is what every reef should aspire to."
    ),
    'tubbataha.yaml': (
        "Tubbataha is open just three months a year and accessible only by liveaboard. Late-season "
        "dives deliver whale sharks on the north atoll, tiger sharks cruising the walls, and mantas "
        "at cleaning stations on nearly every dive. The reefs are UNESCO-protected, with some of the "
        "healthiest coral in the Philippines. No villages, no resorts, no day boats — just ten "
        "liveaboards, forty divers each, and a hundred thousand hectares of pristine ocean. Tubbataha "
        "is what the Coral Triangle looked like fifty years ago."
    ),
    'wakatobi.yaml': (
        "Wakatobi is what happens when a resort invests twenty-five years in reef conservation. The "
        "house reef alone has more coral diversity than most entire dive destinations — centuries-old "
        "table corals, sea fans the size of small cars, pygmy seahorses in impossible yellow. Wakatobi "
        "is luxe: private villas, gourmet meals, and dive guides who know every nudibranch by its "
        "Latin name. It is also eye-wateringly expensive at five hundred dollars-plus per day. Not for "
        "budget travelers, but for world-class diving with zero compromise on comfort, Wakatobi "
        "delivers completely."
    ),
}

PATTERN = re.compile(
    r"^editorName:\s*'[^']*'\s*\n^editorTake:\s*\|\s*\n(?:^[ \t]+.*\n?)*",
    re.M,
)

def main():
    processed = skipped = 0
    for path in sorted(glob.glob('src/content/destinations/*.yaml')):
        fn = path.replace('\\', '/').split('/')[-1]
        text = open(path, encoding='utf-8').read()
        if fn not in REPLACEMENTS:
            skipped += 1
            print(f'SKIP  {fn}')
            continue
        # Detect existing block indentation
        m_indent = re.search(r'^editorTake:\s*\|\s*\n([ \t]+)\S', text, re.M)
        indent = m_indent.group(1) if m_indent else '  '
        new_take = '\n'.join(indent + line for line in REPLACEMENTS[fn].split('\n'))
        new_text, n = PATTERN.subn(f"editorTake: |\n{new_take}\n", text, count=1)
        if n == 1:
            open(path, 'w', encoding='utf-8', newline='\n').write(new_text)
            processed += 1
            print(f'OK    {fn} (indent={len(indent)}) len={len(REPLACEMENTS[fn])}')
        else:
            print(f'FAIL  {fn}: pattern did not match')

    print(f'\nProcessed: {processed}, Skipped (no rewrite): {skipped}')

    # Verify no editorName remains
    remaining = [p for p in glob.glob('src/content/destinations/*.yaml')
                 if re.search(r'^editorName', open(p, encoding='utf-8').read(), re.M)]
    print(f'Remaining editorName occurrences: {len(remaining)}')
    for p in remaining:
        print('  -', p)

if __name__ == '__main__':
    main()
