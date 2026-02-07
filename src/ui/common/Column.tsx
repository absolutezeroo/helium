import type {JSX} from 'solid-js';
import {Flex} from './Flex';
import type {FlexProps} from './Flex';

export type ColumnProps = Omit<FlexProps, 'column'>;

export function Column(props: ColumnProps): JSX.Element
{
	return <Flex {...props} column={true} />;
}
