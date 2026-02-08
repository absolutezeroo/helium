import type {JSX} from 'solid-js';
import {createSignal, onMount, Show, For} from 'solid-js';
import {ModuleId, useModule} from '@ui/bridge';
import {useLocalization} from '@ui/hooks/useLocalization';

/**
 * PromoArticleWidgetView - Displays promotional articles with navigation bullets.
 * @see source_nitro_react/components/hotel-view/views/widgets/promo-article/PromoArticleWidgetView.tsx
 */
export function PromoArticleWidgetView(): JSX.Element
{
	const {state: landingView, actions} = useModule(ModuleId.LandingView);
	const [index, setIndex] = createSignal(0);
	const t = useLocalization();

	onMount(() =>
	{
		actions.requestPromoArticles();
	});

	return (
		<Show when={landingView().articles}>
			{(articleList) => (
				<div class="promo-articles widget mb-2">
					<div class="d-flex flex-row align-items-center w-100 mb-1">
						<small class="flex-shrink-0 pe-1">{t('landing.view.promo.article.header', 'What\'s new')}</small>
						<hr class="w-100 my-0" />
					</div>
					<div class="d-flex flex-row mb-1">
						<For each={articleList()}>
							{(_article, ind) => (
								<div
									class={`promo-articles-bullet cursor-pointer ${ind() === index() ? 'promo-articles-bullet-active' : ''}`}
									onClick={() => setIndex(ind())}
								/>
							)}
						</For>
					</div>
					<Show when={articleList()[index()]}>
						{(article) => (
							<div class="promo-article d-flex flex-row row mx-0">
								<div class="promo-article-image" style={{
									'background-image': `url(${article().imageUrl})`
								}} />
								<div class="col-3 d-flex flex-column h-100">
									<h3 class="my-0">{article().title}</h3>
									<b>{article().bodyText}</b>
									<button
										class="btn btn-sm mt-auto btn-gainsboro"
										onClick={() => window.open(article().linkContent)}
									>
										{article().buttonText}
									</button>
								</div>
							</div>
						)}
					</Show>
				</div>
			)}
		</Show>
	);
}
