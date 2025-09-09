declare module 'react-rating-stars-component' {
  import { ComponentType } from 'react';

  interface ReactStarsProps {
    count?: number;
    onChange?: (newRating: number) => void;
    size?: number;
    activeColor?: string;
    color?: string;
    value?: number;
    a11y?: boolean;
    isHalf?: boolean;
    emptyIcon?: React.ReactElement;
    halfIcon?: React.ReactElement;
    filledIcon?: React.ReactElement;
    edit?: boolean;
    classNames?: string;
  }

  const ReactStars: ComponentType<ReactStarsProps>;
  export default ReactStars;
}