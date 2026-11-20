import test from 'node:test';
import assert from 'node:assert/strict';
import { homeFeatureEvidence } from '../home-feature-evidence.mjs';
const response = (agent, prompt) => ({agent_name: agent, prompt_number: prompt, raw_response: 'Captured answer'});
const mention = (agent, prompt, brand) => ({agent_name: agent, prompt_number: prompt, brand_name_normalized: brand, mentioned: true});
test('an unranked answer adds visibility without becoming a first place or ranked denominator', () => {
  const result = homeFeatureEvidence({
    responses: [response('chatgpt',3),response('claude',3),response('chatgpt',1)],
    mentions: [mention('chatgpt',3,'A'),mention('claude',3,'B'),mention('chatgpt',1,'B'),mention('chatgpt',3,'A')],
    comparison: [{hasResponse:true,rankedBrands:[{name:'A',rank:1}]},{hasResponse:true,rankedBrands:[]}],
  });
  assert.equal(result.rankedComparisons,1);
  assert.deepEqual(result.brands,[{name:'B',mentionCount:2,firstPlaces:0},{name:'A',mentionCount:1,firstPlaces:1}]);
});
test('all-unranked comparisons show no numeric first-place count', () => {
  const result = homeFeatureEvidence({responses:[response('claude',3)],mentions:[mention('claude',3,'A')],comparison:[{hasResponse:true,rankedBrands:[]}]});
  assert.equal(result.rankedComparisons,0);
  assert.equal(result.brands[0].firstPlaces,null);
});
test('explicit joint first places count once per brand and comparative answer', () => {
  const result = homeFeatureEvidence({responses:[response('chatgpt',3)],mentions:[mention('chatgpt',3,'A'),mention('chatgpt',3,'B')],comparison:[{hasResponse:true,rankedBrands:[{name:'A',rank:1},{name:'A',rank:1},{name:'B',rank:1}]}]});
  assert.equal(result.rankedComparisons,1);
  assert.deepEqual(result.brands.map(b=>b.firstPlaces),[1,1]);
});
