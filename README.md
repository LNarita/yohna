# Yohna

Yohna defines and parses new markup syntax for ruby tags, because I writing HTML with `<ruby>` is quite a pain for me  
Currently being used to add furigana to Japanese creative writing, but it should be language agnostic :)

_ps: this was done over a holiday night because of boredom and because I couldn't find a markdown parser that supported phonetic scripts. That being said, do not expect much_

## TODO

- [ ] tests! tests! tests!
- [ ] babel because ES6 ¯\\\_(ツ)_/¯
- [ ] add support for nested ruby texts (ex: `<ruby><ruby>攻<rp>（</rp><rt>こう</rt><rp>）</rp>殻<rp>（</rp><rt>かく</rt><rp>）</rp>機<rp>（</rp><rt>き</rt><rp>）</rp>動<rp>（</rp><rt>どう</rt><rp>）</rp>隊<rp>（</rp><rt>たい</rt><rp>）</rp></ruby><rp>（</rp><rt>Kōkakukidōtai</rt><rp>）</rp></ruby>`)
- [ ] okurigana detection

## Examples

Input:

```
<blockquote>
<p>｛弟達｝（おとうと、たち）はいつも｛機敏｝（ちょこまか）に動いてた</p>
<p>腹は減るけど じっとしてたら 凍っちまうから</p>
<p>運命の｛贈り物｝（おく、り、もの） 不幸を詰めた ｛Матрёшка｝（マトリョーシカ）</p>
<p>開けても 開けても 悲しみばかり</p>
<p>「｛хорошо｝（ハラショー）！｛хорошо｝（ハラショー）！ボルシチには黒コショー！</p>
<p>さぁ、2番はますます涙ちょちょぎれンスキー」 </p>
<p>白く煌めく ｛Волга｝（ヴォルガ） 　風を切り裂いて </p>
<p>走れ ｛Тройка｝（トロイカ）よ　家は遠いか 空駈けろ </p>
<p>妹達もいつも 腹を空かせてた</p>
<p><em>「お兄ちゃん、｛お腹｝（おなか）｛空｝（す）いたよぉ…」</em></p>
<p>頑張れ ｛Катюша｝（カチューシャ）</p>
<p><em>「がーんばれー！」</em></p>
<p>銀のお注射　きっと｛快｝（よ）くなるさ</p>
<p><em>「痛ぇー」</em></p>
<cite>『人生は入れ子人形』Sound Horizon</cite>
</blockquote>
```

Output:


<blockquote>
<p><ruby>弟<rp>(</rp><rt>おとうと</rt><rp>)</rp></ruby><ruby>達<rp>(</rp><rt>たち</rt><rp>)</rp></ruby>はいつも<ruby>機敏<rp>(</rp><rt>ちょこまか</rt><rp>)</rp></ruby>に動いてた</p>
<p>腹は減るけど じっとしてたら 凍っちまうから</p>
<p>運命の<ruby>贈<rp>(</rp><rt>おく</rt><rp>)</rp></ruby>り<ruby>物<rp>(</rp><rt>もの</rt><rp>)</rp></ruby> 不幸を詰めた <ruby>Матрёшка<rp>(</rp><rt>マトリョーシカ</rt><rp>)</rp></ruby></p>
<p>開けても 開けても 悲しみばかり</p>
<p>「<ruby>хорошо<rp>(</rp><rt>ハラショー</rt><rp>)</rp></ruby>！<ruby>хорошо<rp>(</rp><rt>ハラショー</rt><rp>)</rp></ruby>！ボルシチには黒コショー！</p>
<p>さぁ、2番はますます涙ちょちょぎれンスキー」 </p>
<p>白く煌めく <ruby>Волга<rp>(</rp><rt>ヴォルガ</rt><rp>)</rp></ruby> 　風を切り裂いて </p>
<p>走れ <ruby>Тройка<rp>(</rp><rt>トロイカ</rt><rp>)</rp></ruby>よ　家は遠いか 空駈けろ </p>
<p>妹達もいつも 腹を空かせてた</p>
<p><em>「お兄ちゃん、お<ruby>腹<rp>(</rp><rt>なか</rt><rp>)</rp></ruby><ruby>空<rp>(</rp><rt>す</rt><rp>)</rp></ruby>いたよぉ…」</em></p>
<p>頑張れ <ruby>К<rp>(</rp><rt>カ</rt><rp>)</rp></ruby><ruby>а<rp>(</rp><rt>チ</rt><rp>)</rp></ruby><ruby>т<rp>(</rp><rt>ュ</rt><rp>)</rp></ruby><ruby>ю<rp>(</rp><rt>ー</rt><rp>)</rp></ruby><ruby>ш<rp>(</rp><rt>シ</rt><rp>)</rp></ruby><ruby>а<rp>(</rp><rt>ャ</rt><rp>)</rp></ruby></p>
<p><em>「がーんばれー！」</em></p>
<p>銀のお注射　きっと<ruby>快<rp>(</rp><rt>よ</rt><rp>)</rp></ruby>くなるさ</p>
<p><em>「痛ぇー」</em></p>
<cite>『人生は入れ子人形』Sound Horizon</cite>
</blockquote>
